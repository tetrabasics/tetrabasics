import { Application, BaseTexture, Container, Rectangle, SCALE_MODES, Sprite, Texture } from 'pixi.js';
import grid from '/skin/gloss.png'
import loss from '/board/empty.png'
import { CellColor, Direction, MinoType, fenNameToColor, minoToData } from './types';
import { HashMap, IPoint, Point } from './structures';

const GAME_SCALE = 1;
const CELL_SIZE = 30 * GAME_SCALE;
export default class Game {
  // app
  public readonly app: Application<HTMLCanvasElement>;
  public readonly board: Container;

  constructor(
    public readonly width = 10,
    public readonly height = 20,
    // TODO: make options object
    boardString?: string,
    rootElement: HTMLElement = document.body
  ) {
    this.app = new Application<HTMLCanvasElement>({
      width: width * CELL_SIZE,
      height: height * CELL_SIZE
    });
    this.board = this.app.stage.addChild(new Container());
    this.activeMino = new ActiveMino(this);
    rootElement.appendChild(this.app.view);
    this.cells = this.makeCells(boardString);
  }

  // TODO: idk where this even goes LOL
  public makeCells(boardString: string = "_".repeat(this.width * this.height)): HashMap<Point, BoardCell> {
    // TODO: error checking
    const [pieces, _queue] = boardString.split("?");
    // if the board cells have incorrect coordinates, this is the code to change
    return new HashMap<Point, BoardCell>(({ x, y }) => `${x},${y}`, pieces.split("").map((piece, i) => {
      // TODO: remove magic number 19
      const point = new Point(i % this.width, 19 - Math.floor(i / this.width));
      return [point, new BoardCell(this, point, fenNameToColor[piece])];
    }));
  }

  // main board state
  // TODO: make this private to classes that aren't ActiveMino
  public cells: HashMap<Point, BoardCell>;
  // TODO: make private after finished testing
  public activeMino: ActiveMino;
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
    BoardCell.setCellCoordinates(this.sprite, point);
  }

  // TODO: make this available to some classes by export
  public static setCellCoordinates(container: Container, point: IPoint) {
    // If the board displays incorrectly, this is the code to change
    container.x = point.x * CELL_SIZE;
    // TODO: remove magic number 19
    container.y = (19 - point.y) * CELL_SIZE;
  }
  // TODO: same with this but bundle it, check if i even need this
  public static changeCellCoordinates(container: Container, point: IPoint) {
    container.x += point.x * CELL_SIZE;
    container.y += -point.y * CELL_SIZE;
  }

  // TODO: make this available to modules via export
  public static getTexture(color: CellColor): Texture {
    const texture = color == CellColor.NONE ?
      new Texture(BaseTexture.from(loss)) :
      new Texture(BaseTexture.from(grid), new Rectangle(31 * color, 0, CELL_SIZE, CELL_SIZE));
    texture.baseTexture.scaleMode = SCALE_MODES.NEAREST;
    return texture;
  }
}

export class ActiveMino {
  private minoContainer: Container;
  // this is a tuple because if i need to access i'm iterating over each one and not individual lookup
  private cells: { point: Point, sprite: Sprite }[] = [
    { point: new Point(), sprite: new Sprite(BoardCell.getTexture(CellColor.NONE)) },
    { point: new Point(), sprite: new Sprite(BoardCell.getTexture(CellColor.NONE)) },
    { point: new Point(), sprite: new Sprite(BoardCell.getTexture(CellColor.NONE)) },
    { point: new Point(), sprite: new Sprite(BoardCell.getTexture(CellColor.NONE)) },
  ];

  constructor(private game: Game) {
    this.minoContainer = game.app.stage.addChild(new Container());
    this.minoContainer.addChild(...this.cells.map(({ sprite }) => sprite));
    // TODO: remove for testing
    this.generate(MinoType.L);
  }

  private generate(minoType: MinoType) {
    // TODO: destroy current mino if it exists already
    // TODO: move to constant field
    const SPAWN_AREA = new Point(4, 19);
    for (let i = 0; i < this.cells.length; i++) {
      const cell = this.cells[i];
      cell.sprite.texture = BoardCell.getTexture(fenNameToColor[minoType]);
      cell.point = SPAWN_AREA.delta(minoToData[minoType].pieceOffsets[i]);
      BoardCell.setCellCoordinates(cell.sprite, cell.point);
    }
  }

  // TODO: move this to Controls class
  public move(direction: Direction) {
    if (!this.canMove(direction)) return;
    for (let i = 0; i < this.cells.length; i++) {
      const cell = this.cells[i];
      cell.point = cell.point.delta(Point.DELTAS[direction]);
      BoardCell.setCellCoordinates(cell.sprite, cell.point);
    }
  }

  private canMove(direction: Direction): boolean {
    return this.cells.every(({ point }) => {
      const lowerCell = this.game.cells.get(point.delta(Point.DELTAS[direction]));
      return lowerCell && !lowerCell.isSolid;
    });
  }
}