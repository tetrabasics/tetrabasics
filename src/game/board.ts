import { Application, Container } from 'pixi.js';
import { HashMap, IPoint, Point } from '../structures';
import { ValidMinoType, MinoType, fenNameToColor, CellColor } from '../types';
import Cell, { CellData } from './cell';
import Game from './game';
import PieceQueue from './queue';

// TODO: im probably going to regret using inheritance for this so if i do then past me says i told you so
export default class Board extends HashMap<IPoint, Cell> {
  public readonly container: Container;

  constructor(
    private game: Game,
    private app: Application<HTMLCanvasElement>,
    private queue: PieceQueue,
    cellString?: string
  ) {
    super(({ x, y }) => `${x},${y}`);
    this.container = this.app.stage.addChild(new Container());
    this.setCellsFromString(cellString);
  }

  private setCellsFromString(cellString = "_".repeat(this.game.width * this.game.height)) {
    // TODO: error checking
    // if the board cells have incorrect coordinates, this is the code to change
    this.clear();
    cellString.padStart(this.game.width * this.game.height, "_").split("")
      .forEach((piece, i) => {
        const point = new Point(i % this.game.width, (this.game.height - 1) - Math.floor(i / this.game.width));
        this.set(point, new Cell(this, this.app, point, fenNameToColor[piece], point.y < (this.game.height / 2)));
      })
  }



  // checks if a row needs to be cleared and clears it
  public clearLines(rows: Iterable<number>) {
    // TODO: since i'm using a hashmap for cells, clearing rows is decently intensive so i might need to find a better solution
    const clearingRows = new Set([...rows].filter(row => [...this.rowIterator(row)].every(cell => cell.isSolid())));
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

  public getCell(point: IPoint): CellData {
    return this.get(point)!.toData();
  }
}