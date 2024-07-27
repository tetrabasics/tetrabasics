import { Application, Color, Container } from 'pixi.js';
import { HashMap, IPoint, Point } from '../structures';
import { ValidMinoType, MinoType, fenNameToColor, CellColor } from '../types';
import Cell, { CellData } from './cell';
import Game from './game';
import PieceQueue from './queue';
import ActiveMino from './active-mino';

export interface LineClearInfo {
  linesCleared: number
  b2b: number
  combo: number
  spinBonus: 'tspin' | 'mini' | 'none'
}

// TODO: im probably going to regret using inheritance for this so if i do then past me says i told you so
export default class Board extends HashMap<IPoint, Cell> {
  public readonly container: Container;
  // TODO: make these private potentially? idk
  public b2b = 0;
  public combo = 0;

  constructor(
    private game: Game,
    private app: Application<HTMLCanvasElement>,
    private queue: PieceQueue,
    cellString?: string
  ) {
    super(({ x, y }) => `${x},${y}`);
    this.container = this.app.stage.addChild(new Container());
    for (let y = 0; y < this.game.height; y++) {
      for (let x = 0; x < this.game.width; x++) {
        const point = new Point(x, y);
        this.set(point, new Cell(this, this.app, point, point.y < (this.game.height / 2)));
      }
    }
    this.setCellsFromString(cellString);
  }

  public setCellsFromString(cellString = "_".repeat(this.game.width * this.game.height)) {
    // TODO: error checking
    // if the board cells have incorrect coordinates, this is the code to change
    cellString.padStart(this.game.width * this.game.height, "_").split("")
      .forEach((piece, i) => {
        const point = new Point(i % this.game.width, (this.game.height - 1) - Math.floor(i / this.game.width));
        this.get(point)!.Color = fenNameToColor[piece];
      })
  }

  // checks if a row needs to be cleared and clears it
  public clearLines(rows: Iterable<number>): LineClearInfo | null {
    // TODO: since i'm using a hashmap for cells, clearing rows is decently intensive so i might need to find a better solution
    const clearingRows = new Set([...rows]
      .filter(row => [...this.rowIterator(row)]
        .every(cell => cell.isSolid() && cell.Color != CellColor.UNBLOCKABLE)));
    if (!clearingRows.size) return null;
    // rowOffset declares how many rows below this one are currently being cleared
    for (let row = 0, rowOffset = 0; row < this.game.height; row++) {
      if (!rowOffset && !clearingRows.has(row)) continue;
      if (clearingRows.has(row)) {
        for (const cell of this.rowIterator(row)) {
          cell.Color = CellColor.NONE;
        }
        rowOffset++;
      } else {
        // swap rows here (only swapping color because that's the only value that i really need)
        for (let x = 0; x < this.game.width; x++) {
          const currentCell = this.get({ x, y: row - rowOffset })!, lowerCell = this.get({ x, y: row })!;
          currentCell.swap(lowerCell);
        }
      }
    }
    this.combo++;
    if (clearingRows.size > 3) {
      this.b2b++;
    }
    const lineClearInfo: LineClearInfo = {
      combo: this.combo,
      b2b: this.b2b,
      linesCleared: clearingRows.size,
      spinBonus: 'none'
    }
    this.game.events.emit("linesCleared", lineClearInfo);
    return lineClearInfo;
  }

  public injectGarbage(openColumn?: number) {
    openColumn ??= Math.floor(Math.random() * this.game.width);
    const garbageRow = "##########";
    const openRow = `${garbageRow.slice(0, openColumn)}_${garbageRow.slice(openColumn)}`;
    this.injectRow(openRow);
  }

  public injectRow(rowString = "$$$$$$$$$$") {
    // TODO: error handling here
    const injectionString = rowString.padStart(this.game.width, "#");
    // move everything up by one WOW this is a dumb thing to have to write
    for (let y = this.game.height - 1; y > 0; y--) {
      for (let x = 0; x < this.game.width; x++) {
        const currentCell = this.get({ x, y })!, lowerCell = this.get({ x, y: y - 1 })!;
        currentCell.swap(lowerCell);
      }
    }
    for (let x = 0; x < this.game.width; x++) {
      this.get({ x, y: 0 })!.Color = fenNameToColor[rowString[x]];
    }
    this.game.updateMino();
  }

  // functions to iterate through rows and columns to make it easier
  private *rowIterator(y: number) {
    if (y < 0 || y >= this.game.height) return;
    for (let x = 0; x < this.game.width; x++) {
      yield this.get({ x, y })!;
    }
  }
  private *colIterator(x: number) {
    if (x < 0 || x >= this.game.width) return;
    for (let y = 0; y < this.game.width; y++) {
      yield this.get({ x, y })!;
    }
  }

  // these methods are for the end user to view
  // TODO: this is a copy of the map so use toData in event listeners to not have to run this all the time
  public getBoard(): HashMap<IPoint, CellData> {
    const map = new HashMap<IPoint, CellData>(({ x, y }) => `${x},${y}`);
    for (const [point, boardCell] of this.entries()) {
      map.set(point, boardCell.toData());
    }
    return map;
  }

  public resetState() {
    this.b2b = this.combo = 0;
  }

  public gameOver() {
    this.forEach(cell => cell.isSolid() && (cell.Color = CellColor.UNBLOCKABLE));
  }
}