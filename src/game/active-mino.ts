import { Application, Container, Sprite } from 'pixi.js';
import { HashMap, IPoint, Point } from '../structures';
import { MinoType, Direction, CellColor, minoToData, fenNameToColor, iKickTable, mainKickTable, flipKickTable, ValidMinoType, InvalidMinoType } from '../types';
import BoardCell from './board-cell';
import Game from './game';
import PieceQueue from './queue';

// For piece queues, basically just minos that don't move at all
export class StaticMino {
  protected minoContainer: Container;
  protected origin = new Point(0, 0);
  // this is a tuple because if i need to access i'm iterating over each one and not individual lookup
  protected readonly cells = [
    { point: new Point(), sprite: new Sprite(BoardCell.getTexture(CellColor.NONE)) },
    { point: new Point(), sprite: new Sprite(BoardCell.getTexture(CellColor.NONE)) },
    { point: new Point(), sprite: new Sprite(BoardCell.getTexture(CellColor.NONE)) },
    { point: new Point(), sprite: new Sprite(BoardCell.getTexture(CellColor.NONE)) }
  ];

  // TODO: remove thing for invalid minos
  public assemble(minoType: MinoType, origin: Point) {
    // TODO: destroy current mino if it exists already
    this.origin = origin.delta(minoToData[minoType].cursorOffset);
    for (let i = 0; i < this.cells.length; i++) {
      const cell = this.cells[i];
      cell.sprite.texture = BoardCell.getTexture(fenNameToColor[minoType]);
      cell.point = this.origin.delta(minoToData[minoType].pieceOffsets[i]);
      BoardCell.setCellCoordinates(cell.sprite, cell.point);
    }
  }

  constructor(app: Application<HTMLCanvasElement>) {
    this.minoContainer = app.stage.addChild(new Container());
    this.minoContainer.addChild(...this.cells.map(({ sprite }) => sprite));
  }
}

// These ones DO move
export default class ActiveMino extends StaticMino {
  // TODO: move active mino state into another class maybe
  private activeMinoType: MinoType = InvalidMinoType.NONE;
  private rotation = Direction.UP;

  constructor(private game: Game, private boardCells: HashMap<IPoint, BoardCell>, private pieceQueue: PieceQueue) {
    super(game.app);
    // TODO: remove for testing
    this.generate(pieceQueue.next());
  }

  private generate(minoType: MinoType) {
    this.activeMinoType = minoType;
    this.rotation = Direction.UP;
    this.assemble(minoType, new Point(4, 19));
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
      const nextCell = this.boardCells.get(movingTo(point));
      return nextCell && !nextCell.isSolid();
    })) return false;

    for (let i = 0; i < this.cells.length; i++) {
      const cell = this.cells[i];
      cell.point = movingTo(cell.point);
      BoardCell.setCellCoordinates(cell.sprite, cell.point);
    }
    return true;
  }

  public rotate(rotationCount: -1 | 1 | 2) {
    // make sure to undo this action if no rotations work
    const oldRotation = this.rotation;
    this.rotation = (this.rotation + rotationCount + 4) % 4;
    // TODO: keep origin and point state organized so i don't have to change origin position every time i move uuururrrrghghghghgh
    // and also recalculate origin + offset when doing these moves
    const mainAttempt = this.displace(point => {
      const { x, y } = point.delta({ x: -this.origin.x, y: -this.origin.y });
      const flippedOffset = {
        [-1]: { x: -y, y: x },
        [1]: { x: y, y: -x },
        [2]: { x: -x, y: -y }
      }[rotationCount];
      return this.origin.delta(flippedOffset);
    });
    if (mainAttempt) return;
    // TODO: rewrite this.displace() so that it can take multiple fallback points
    // TODO: this looks ugly i should change this
    const offsets = rotationCount == 2 ? flipKickTable[oldRotation] :
      (this.activeMinoType == ValidMinoType.I ? iKickTable : mainKickTable)[oldRotation][rotationCount == 1 ? "cw" : "ccw"];
    const tableAttempt = offsets.find(offset => this.displace(point => {
      // TODO: make any changes from the above rotation attempt to this too
      const { x, y } = point.delta({ x: -this.origin.x, y: -this.origin.y });
      const flippedOffset = {
        [-1]: { x: -y, y: x },
        [1]: { x: y, y: -x },
        [2]: { x: -x, y: -y }
      }[rotationCount];
      return this.origin.delta(flippedOffset).delta(offset);
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
      this.boardCells.get(point)!.Color = minoToData[this.activeMinoType].color;
    }
    // TODO: maybe check all lines if a row can be cleared? this might not be needed but it could help
    this.game.clearLines(new Set(this.cells.map(cell => cell.point.y)));
    // TODO: this shows as any what the fuck
    this.generate(this.pieceQueue.next());
  }
}