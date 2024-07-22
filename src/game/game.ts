import { Application, Container } from 'pixi.js';
import { HashMap, IPoint, Point } from '../structures';
import { fenNameToColor, CellColor, MinoType, ValidMinoType } from '../types';
import ActiveMino from './active-mino';
import BoardCell, { BoardCellData } from './board-cell';
import GameControls from './controls';
import PieceQueue from './queue';
import PieceHold from './hold';
import GameEvents from './events';

export const GAME_SCALE = 1;
export const CELL_SIZE = 30;

/* The main class that creates a game object. This contains the main game structure and composes key classes for functionality. */
export default class Game {
  // app
  // TODO: make these private except GameEvents
  public readonly app: Application<HTMLCanvasElement>;
  public readonly board: Container;
  public readonly controls: GameControls;
  public readonly events: GameEvents;

  constructor(
    public readonly width = 10,
    public readonly height = 40,
    // TODO: make options object
    boardString?: string,
    rootElement: HTMLElement = document.getElementById("board")!,
    public readonly peekRows = 2
  ) {
    // TODO: start the game paused
    // game components
    const holdDiv = document.createElement("div");
    holdDiv.className = "board-hold";
    rootElement.appendChild(holdDiv);
    const boardDiv = document.createElement("div");
    boardDiv.className = "board-main";
    rootElement.appendChild(boardDiv);
    const queueDiv = document.createElement("div");
    queueDiv.className = "board-queue";
    rootElement.appendChild(queueDiv);

    this.app = new Application<HTMLCanvasElement>({
      width: width * CELL_SIZE * GAME_SCALE,
      height: ((height / 2) + peekRows) * CELL_SIZE * GAME_SCALE
    });
    this.app.stage.scale = { x: GAME_SCALE, y: GAME_SCALE };
    this.board = this.app.stage.addChild(new Container());
    boardDiv.appendChild(this.app.view);
    // initialize composite classes
    this.events = new GameEvents(this);
    this.cells = this.makeCells(boardString);
    this.queue = new PieceQueue(this, queueDiv);
    this.hold = new PieceHold(this, holdDiv);
    this.activeMino = new ActiveMino(this, this.cells, this.queue, this.hold);
    this.controls = new GameControls(this, this.activeMino);
  }

  // TODO: idk where this even goes LOL
  public makeCells(boardString: string = "_".repeat(this.width * this.height)): HashMap<IPoint, BoardCell> {
    // TODO: error checking
    // TODO: finish implementing queue system
    const [pieces, queue] = boardString.split("?");
    if (queue) {
      const validMinos = Object.values(ValidMinoType).join("");
      // enum validation for string, too lazy to split and use a type guard
      if (!new RegExp(`^[${validMinos}]+$`).test(queue)) throw new Error();
      // TODO: since this is a side effect make the entire method a whole ass side effect
      this.queue.queue = (queue.split("") as MinoType[]).values();
    }
    // if the board cells have incorrect coordinates, this is the code to change
    return new HashMap<IPoint, BoardCell>(({ x, y }) => `${x},${y}`, pieces.padStart(this.width * this.height, "_").split("").map((piece, i) => {
      const point = new Point(i % this.width, (this.height - 1) - Math.floor(i / this.width));
      return [point, new BoardCell(this, point, fenNameToColor[piece], point.y < (this.height / 2))];
    }));
  }

  // main board state
  private cells: HashMap<IPoint, BoardCell>;
  private activeMino: ActiveMino;
  private queue: PieceQueue;
  private hold: PieceHold;

  // checks if a row needs to be cleared and clears it
  public clearLines(rows: Iterable<number>) {
    // TODO: since i'm using a hashmap for cells, clearing rows is decently intensive so i might need to find a better solution
    const clearingRows = new Set([...rows].filter(row => [...this.rowIterator(row)].every(cell => cell.isSolid())));
    // rowOffset declares how many rows below this one are currently being cleared
    for (let row = 0, rowOffset = 0; row < this.height; row++) {
      if (!rowOffset && !clearingRows.has(row)) continue;
      if (clearingRows.has(row)) {
        for (const cell of this.rowIterator(row)) {
          cell.Color = CellColor.NONE;
        }
        rowOffset++;
      } else {
        // swap rows here (only swapping color because that's the only value that i really need)
        for (let x = 0; x < this.width; x++) {
          const currentCell = this.cells.get({ x, y: row - rowOffset })!, lowerCell = this.cells.get({ x, y: row })!;
          [currentCell.Color, lowerCell.Color] = [lowerCell.Color, currentCell.Color];
          [currentCell.metadata, lowerCell.metadata] = [lowerCell.metadata, currentCell.metadata];
        }
      }
    }
  }

  // functions to iterate through rows and columns to make it easier
  private *rowIterator(y: number) {
    if (y < 0 || y >= this.height) return;
    for (let x = 0; x < this.width; x++) {
      yield this.cells.get({ x, y })!;
    }
  }
  private *colIterator(x: number) {
    if (x < 0 || x >= this.width) return;
    for (let y = 0; y < this.width; y++) {
      yield this.cells.get({ x, y })!;
    }
  }

  // these methods are for the end user to view
  // TODO: this is a copy of the map so use toData in event listeners to not have to run this all the time
  public getBoard(): HashMap<IPoint, BoardCellData> {
    const map = new HashMap<IPoint, BoardCellData>(({ x, y }) => `${x},${y}`);
    for (const [point, boardCell] of this.cells.entries()) {
      map.set(point, boardCell.toData());
    }
    return map;
  }

  public getCell(point: IPoint): BoardCellData {
    return this.cells.get(point)!.toData();
  }
}