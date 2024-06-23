import { Application, BaseTexture, Container, Rectangle, SCALE_MODES, Sprite, Texture } from 'pixi.js';
import grid from '/skin/gloss.png'
import loss from '/board/empty.png'
import { fenNameToColor, CellColor, Point } from './types';

const GAME_SCALE = 1;
const CELL_SIZE = 30;
export default class Game {
  // app
  public readonly app: Application<HTMLCanvasElement>;
  public readonly board: Container;

  constructor(
    public width = 10,
    public height = 20,
    boardString?: string
  ) {
    this.app = new Application<HTMLCanvasElement>({
      width: width * GAME_SCALE * CELL_SIZE,
      height: height * GAME_SCALE * CELL_SIZE
    });
    this.board = this.app.stage.addChild(new Container())
    document.body.appendChild(this.app.view);
    this.cells = this.makeCells(boardString);
  }

  public makeCells(boardString?: string): Record<string, BoardCell> {
    boardString ||= "_".repeat(this.width * this.height);
    // TODO: error checking
    const [pieces, _queue] = boardString.split("?");
    return pieces.split("").reduce((a, b, i) => {
      const row = Math.floor(i / this.width), col = i % this.width;
      const cell = new BoardCell(this, row, col, fenNameToColor[b]);
      a[this.hashPoint({ x: row, y: col })] = cell;
      return a;
    }, {} as Record<string, BoardCell>);
  }
  
  // main board state
  public cells: Record<string, BoardCell>;
  // hash to string because fuck javascript hash codes
  public hashPoint = ({ x, y }: Point): string => `${x},${y}`;
}

export class BoardCell {
  public sprite: Sprite
  // TODO: maybe using getters and setters isn't the best idea
  get isSolid() { return this.color != CellColor.NONE; }
  get Color() { return this.color }
  set Color(color: CellColor) {
    this.sprite.texture = BoardCell.getTexture(color);
    this.color = color;
  }
  constructor(
    game: Game,
    public row: number,
    public column: number,
    private color = CellColor.NONE,
  ) {
    this.sprite = new Sprite(BoardCell.getTexture(color));
    game.board.addChild(this.sprite);
    this.sprite.x = column * GAME_SCALE * CELL_SIZE;
    this.sprite.y = row * GAME_SCALE * CELL_SIZE;
  }

  // TODO: make this available to modules via export
  public static getTexture(color: CellColor): Texture {
    const texture = color == CellColor.NONE ?
      new Texture(BaseTexture.from(loss)) :
      new Texture(BaseTexture.from(grid), new Rectangle(31 * color, 0, 30, 30))
    texture.baseTexture.scaleMode = SCALE_MODES.NEAREST;
    return texture;
  }
}