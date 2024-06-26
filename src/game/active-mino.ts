import { Container, Sprite } from 'pixi.js';
import { Point } from '../structures';
import { MinoType, Direction, CellColor, minoToData, fenNameToColor, iKickTable, mainKickTable } from '../types';
import BoardCell from './board-cell';
import Game from './game';

/* Contains the state and properties for the active mino that will eventually be placed. */
export default class ActiveMino {
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
  public move(direction: Direction): boolean {
    const isMoved = this.displace(point => point.delta(Point.DELTAS[direction]));
    if (!isMoved) return false;
    this.origin = this.origin.delta(Point.DELTAS[direction]);
    return true;
  }

  // displaces all points of the active mino, NOT moving the origin in the process. Returns if successful.
  private displace(movingTo: (point: Point) => Point): boolean {
    if (!this.cells.every(({ point }) => {
      const nextCell = this.game.cells.get(movingTo(point));
      return nextCell && !nextCell.isSolid();
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
    // TODO: idk i think there might need to be more code i'm just not sure what
  }

  public place() {
    // TODO: make this hard drop and move it somewhere else
    while (this.move(Direction.DOWN));
    for (const { point } of this.cells) {
      this.game.cells.get(point)!.Color = minoToData[this.activeMinoType].color;
    }
    // TODO: clear lines when a piece fills
    // TODO: maybe check all lines if a row can be cleared? this might not be needed but it could help
    this.game.clearLines(new Set(this.cells.map(cell => cell.point.y)));
    const validMinos = Object.values(MinoType).filter(x => x != MinoType.NONE);
    this.generate(validMinos[Math.floor(Math.random() * validMinos.length)]);
  }
}