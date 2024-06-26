import { Application, Container } from 'pixi.js';
import { HashMap, IPoint, Point } from '../structures';
import { fenNameToColor, CellColor } from '../types';
import ActiveMino from './active-mino';
import BoardCell from './board-cell';
import GameControls from './controls';

export const GAME_SCALE = 1;
export const CELL_SIZE = 30 * GAME_SCALE;

/* The main class that creates a game object. This contains the main game structure and composes key classes for functionality. */
export default class Game {
  // app
  // TODO: idk if i want these to be public maybe i can hide it
  public readonly app: Application<HTMLCanvasElement>;
  public readonly board: Container;
  public readonly controls: GameControls;

  constructor(
    public readonly width = 10,
    public readonly height = 40,
    // TODO: make options object
    boardString?: string,
    rootElement: HTMLElement = document.body
  ) {
    this.app = new Application<HTMLCanvasElement>({
      width: width * CELL_SIZE,
      height: height / 2 * CELL_SIZE
    });
    this.board = this.app.stage.addChild(new Container());
    // initialize composition classes
    this.activeMino = new ActiveMino(this);
    this.controls = new GameControls(this, this.activeMino);
    rootElement.appendChild(this.app.view);
    this.cells = this.makeCells(boardString);
  }

  // TODO: idk where this even goes LOL
  public makeCells(boardString: string = "_".repeat(this.width * this.height)): HashMap<IPoint, BoardCell> {
    // TODO: error checking
    const [pieces, _queue] = boardString.split("?");
    // if the board cells have incorrect coordinates, this is the code to change
    return new HashMap<IPoint, BoardCell>(({ x, y }) => `${x},${y}`, pieces.padStart(400, "_").split("").map((piece, i) => {
      // TODO: remove magic number 19
      const point = new Point(i % this.width, 39 - Math.floor(i / this.width));
      // TODO: make top board cells invisible
      return [point, new BoardCell(this, point, fenNameToColor[piece])];
    }));
  }

  // main board state
  // TODO: make this private to classes that aren't ActiveMino
  public cells: HashMap<IPoint, BoardCell>;
  private activeMino: ActiveMino;

  // checks if a row needs to be cleared and clears it
  public clearLines(rows: Set<number>) {
    // TODO: since i'm using a hashmap for cells, clearing rows is decently intensive so i need to find a better solution (~1ms is subjective)
    const clearingRows = new Set([...rows].filter(row => this.rowIsFilled(row)));
    // rowOffset declares how many rows below this one are currently being cleared
    for (let row = 0, rowOffset = 0; row < this.height; row++) {
      if (!rowOffset && !clearingRows.has(row)) continue;
      if (clearingRows.has(row)) {
        // TODO: could maybe abstract this code to loop over all cells in a row?
        for (let x = 0; x < this.width; x++) {
          this.cells.get({ x, y: row })!.Color = CellColor.NONE;
        }
        rowOffset++;
      } else {
        // swap rows here (only swapping color because that's the only value that i really need)
        for (let x = 0; x < this.width; x++) {
          const currentCell = this.cells.get({ x, y: row - rowOffset })!, lowerCell = this.cells.get({ x, y: row })!;
          [currentCell.Color, lowerCell.Color] = [lowerCell.Color, currentCell.Color];
        }
      }
    }
  }

  private rowIsFilled(row: number) {
    for (let x = 0; x < this.width; x++) {
      if (!this.cells.get({ x, y: row })!.isSolid()) return false;
    }
    return true;
  }
}