import { Application, BaseTexture, Container, Rectangle, SCALE_MODES, Sprite, Texture } from 'pixi.js';
import grid from '/skin/gloss.png'
import loss from '/board/empty.png'
import { CellColor, fenNameToColor } from './types';
import { HashMap, Point } from './structures';

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

  public makeCells(boardString: string = "_".repeat(this.width * this.height)): HashMap<Point, BoardCell> {
    // TODO: error checking
    const [pieces, _queue] = boardString.split("?");
    // if the board cells have incorrect oordinates, this is the code to change
    return new HashMap<Point, BoardCell>(({ x, y }) => `${x},${y}`, pieces.split("").map((piece, i) => {
      // TODO: remove magic number -19
      const point = new Point(i % this.width, 19 - Math.floor(i / this.width));
      return [point, new BoardCell(this, point, fenNameToColor[piece])];
    }));
  }

  // main board state
  public cells: HashMap<Point, BoardCell>;
}

export class BoardCell {
  public sprite: Sprite;
  // TODO: maybe using getters and setters isn't the best idea
  get isSolid() { return this.color != CellColor.NONE; }
  get Color() { return this.color }
  set Color(color: CellColor) {
    this.sprite.texture = BoardCell.getTexture(color);
    this.color = color;
  }
  constructor(
    game: Game,
    public point: Point,
    private color = CellColor.NONE,
  ) {
    this.sprite = new Sprite(BoardCell.getTexture(color));
    game.board.addChild(this.sprite);
    // If the board displays incorrectly, this is the code to change
    this.sprite.x = point.x * GAME_SCALE * CELL_SIZE;
    this.sprite.y = (19 - point.y) * GAME_SCALE * CELL_SIZE;
  }

  // TODO: make this available to modules via export
  public static getTexture(color: CellColor): Texture {
    const texture = color == CellColor.NONE ?
      new Texture(BaseTexture.from(loss)) :
      new Texture(BaseTexture.from(grid), new Rectangle(31 * color, 0, 30, 30));
    texture.baseTexture.scaleMode = SCALE_MODES.NEAREST;
    return texture;
  }
}