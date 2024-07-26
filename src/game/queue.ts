import { Application } from 'pixi.js';
import { CellColor, InvalidMinoType, MinoType, ValidMinoType, minoToData } from '../types';
import Game, { CELL_SIZE, GAME_SCALE } from './game';
import { StaticMino } from './active-mino';
import { Point } from '../structures';

const QUEUE_SIZE = 0.75;
export default class PieceQueue {
  private queueWindows: PieceWindow[];
  private queue: Iterator<MinoType, MinoType, undefined> = this.nextPiece();
  // TODO: private
  constructor(
    game: Game,
    rootElement: HTMLElement,
    queueAmount = 5,
  ) {
    this.queueWindows = Array.from({ length: queueAmount }, () => new PieceWindow(rootElement, QUEUE_SIZE * GAME_SCALE));
  }

  public setQueue(queueString?: string) {
    if (!queueString) {
      this.queue = this.nextPiece();
    } else {
      const validMinos = Object.values(ValidMinoType).join("");
      // enum validation for string, too lazy to split and use a type guard
      if (!new RegExp(`^[${validMinos}]+$`).test(queueString)) throw new Error();
      this.queue = (queueString.split("") as MinoType[]).values();
    }

    for (const window of this.queueWindows) {
      window.setPiece(this.queue.next().value);
    }
  }

  public next() {
    const next = this.queueWindows[0].currentMino;
    for (let i = 0; i < this.queueWindows.length - 1; i++) {
      this.queueWindows[i].setPiece(this.queueWindows[i + 1].currentMino);
    }
    this.queueWindows.at(-1)!.setPiece(this.queue.next().value ?? InvalidMinoType.NONE);
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
  constructor(rootElement: HTMLElement, scale = 1) {
    this.app = new Application<HTMLCanvasElement>({
      width: 5 * CELL_SIZE * scale,
      height: 5 * CELL_SIZE * scale
    });
    this.app.stage.scale = { x: scale, y: scale };
    this.staticMino = new StaticMino(this.app);
    rootElement.appendChild(this.app.view);
  }

  public setPiece(minoType: MinoType, colorOverride?: CellColor) {
    this.currentMino = minoType;
    const { x, y } = minoToData[minoType].cursorOffset;
    const origin = new Point(2, 1.5).delta({ x: -x, y: -y });
    this.staticMino.assemble(minoType, origin, colorOverride);
  }
}