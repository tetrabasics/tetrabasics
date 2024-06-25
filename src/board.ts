import { Application, BaseTexture, Container, Rectangle, SCALE_MODES, Sprite, Texture } from 'pixi.js';
import grid from '/skin/gloss.png'
import loss from '/board/empty.png'
import { CellColor, Direction, MinoType, fenNameToColor, iKickTable, mainKickTable, minoToData } from './types';
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
  public makeCells(boardString: string = "_".repeat(this.width * this.height)): HashMap<IPoint, BoardCell> {
    // TODO: error checking
    const [pieces, _queue] = boardString.split("?");
    // if the board cells have incorrect coordinates, this is the code to change
    return new HashMap<IPoint, BoardCell>(({ x, y }) => `${x},${y}`, pieces.split("").map((piece, i) => {
      // TODO: remove magic number 19
      const point = new Point(i % this.width, 19 - Math.floor(i / this.width));
      return [point, new BoardCell(this, point, fenNameToColor[piece])];
    }));
  }

  // main board state
  // TODO: make this private to classes that aren't ActiveMino
  public cells: HashMap<IPoint, BoardCell>;
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
  // TODO: move active mino state into another class maybe
  private activeMinoType = MinoType.NONE;
  private rotation = Direction.UP;
  private origin = new Point(0, 0);
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
    this.generate(MinoType.J);
  }

  private generate(minoType: MinoType) {
    this.activeMinoType = minoType;
    this.rotation = Direction.UP;
    // TODO: destroy current mino if it exists already
    this.origin = new Point(4, 19).delta(minoToData[minoType].cursorOffset);
    for (let i = 0; i < this.cells.length; i++) {
      const cell = this.cells[i];
      cell.sprite.texture = BoardCell.getTexture(fenNameToColor[minoType]);
      cell.point = this.origin.delta(minoToData[minoType].pieceOffsets[i]);
      BoardCell.setCellCoordinates(cell.sprite, cell.point);
    }
  }

  // TODO: move this to Controls class
  public move(direction: Direction) {
    const isMoved = this.displace(point => point.delta(Point.DELTAS[direction]));
    if (!isMoved) return;
    this.origin = this.origin.delta(Point.DELTAS[direction]);
  }

  // displaces all points of the active mino, NOT moving the origin in the process. Returns if successful.
  private displace(movingTo: (point: Point) => Point): boolean {
    if (!this.cells.every(({ point }) => {
      const nextCell = this.game.cells.get(movingTo(point));
      return nextCell && !nextCell.isSolid;
    })) return false;

    for (let i = 0; i < this.cells.length; i++) {
      const cell = this.cells[i];
      cell.point = movingTo(cell.point);
      BoardCell.setCellCoordinates(cell.sprite, cell.point);
    }
    return true;
  }

  public rotate(clockwise: boolean) {
    // make sure to undo this action if no rotations work
    const oldRotation = this.rotation;
    this.rotation = (this.rotation + (clockwise ? 1 : -1) + 4) % 4;
    // TODO: keep origin and point state organized so i don't have to change origin position every time i move uuururrrrghghghghgh
    // and also recalculate origin + offset when doing these moves
    const mainAttempt = this.displace(point => {
      const { x, y } = point.delta({ x: -this.origin.x, y: -this.origin.y });
      const flipped = clockwise ? { x: y, y: -x } : { x: -y, y: x };
      return this.origin.delta(flipped);
    });
    if (mainAttempt) return;
    // TODO: rewrite this.displace() so that it can take multiple fallback points
    const kickTable = this.activeMinoType == MinoType.I ? iKickTable : mainKickTable;
    // TODO: i dont like how i have to use the old rotation, maybe change the kick table around
    const offsets = kickTable[oldRotation][clockwise ? "cw" : "ccw"];
    const tableAttempt = offsets.find(offset => this.displace(point => {
      // TODO: make any changes from the above rotation attempt to this too
      const { x, y } = point.delta({ x: -this.origin.x, y: -this.origin.y });
      const flipped = clockwise ? { x: y, y: -x } : { x: -y, y: x };
      return this.origin.delta(flipped).delta(offset);
    }));
    if (!tableAttempt) {
      this.rotation = oldRotation;
      return;
    }
    this.origin = this.origin.delta(tableAttempt);
    // TODO: idk i think there might need to be mroe code i'm just not sure what
  }
}