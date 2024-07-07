import { Application } from 'pixi.js';
import { InvalidMinoType, MinoType, ValidMinoType, minoToData } from '../types';
import Game, { CELL_SIZE } from './game';
import { StaticMino } from './active-mino';
import { Point } from '../structures';

export default class PieceQueue {
  private queueWindows: PieceWindow[];
  // TODO: private
  public queue: Iterator<MinoType, MinoType, undefined> = this.nextPiece();
  constructor(game: Game, private rootElement: HTMLElement, queueAmount = 5) {
    this.queueWindows = Array.from({ length: queueAmount }, () => new PieceWindow(rootElement));
    for (const window of this.queueWindows) {
      window.setPiece(this.queue.next().value);
    }
  }

  public next() {
    const next = this.queueWindows[0].currentMino;
    for (let i = 0; i < this.queueWindows.length - 1; i++) {
      this.queueWindows[i].setPiece(this.queueWindows[i + 1].currentMino);
    }
    this.queueWindows.at(-1)!.setPiece(this.queue.next().value);
    return next;
  }

  private *nextPiece(): Generator<MinoType, MinoType, undefined> {
    while (true) {
      yield* Object.values(ValidMinoType)
        .map(value => ({ value, key: Math.random() }))
        .sort((a, b) => a.key - b.key)
        .map(({ value }) => value);
    }
  }
}

// TODO: move to new file and call default, or remove the middleman class
export class PieceWindow {
  private app: Application<HTMLCanvasElement>;
  private staticMino: StaticMino;
  // TODO: use getter and setter without using getters and setters
  public currentMino: MinoType = InvalidMinoType.NONE;
  constructor(rootElement: HTMLElement) {
    this.app = new Application<HTMLCanvasElement>({
      width: 5 * CELL_SIZE,
      height: 5 * CELL_SIZE
    });
    this.staticMino = new StaticMino(this.app);
    rootElement.appendChild(this.app.view);
  }

  public setPiece(minoType: MinoType) {
    this.currentMino = minoType;
    const { x, y } = minoToData[minoType].cursorOffset;
    const origin = new Point(2, 1.5).delta({ x: -x, y: -y });
    this.staticMino.assemble(minoType, origin);
  }
}