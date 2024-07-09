import { Direction } from '../types';
import ActiveMino from './active-mino';
import Game from './game';
import BiMap from 'bidirectional-map';

export enum Action {
  MOVE_LEFT,
  MOVE_RIGHT,
  SOFT_DROP,
  HARD_DROP,
  ROTATE_CW,
  ROTATE_CCW,
  ROTATE_180,
  HOLD,
  PAUSE
}

/* Handles behavior from the player and the lesson planner for interaction with the board. */
export default class GameControls {
  // TODO: make this changeable by browsers
  // TODO: maybe replace bidirectional map import, it's not super needed
  private controls: BiMap<Action> = new BiMap({
    a: Action.MOVE_LEFT,
    d: Action.MOVE_RIGHT,
    s: Action.SOFT_DROP,
    w: Action.HARD_DROP,
    k: Action.ROTATE_CCW,
    l: Action.ROTATE_CW,
    i: Action.ROTATE_180,
    o: Action.HOLD,
    enter: Action.PAUSE
  });
  private pressedKeys = new Set<string>();
  // for calculating delta
  constructor(game: Game, private activeMino: ActiveMino) {
    // TODO: maybe change the body to a smaller focus window (Game rootElement constructor)
    document.body.onkeydown = event => this.keyDown(event);
    document.body.onkeyup = event => this.keyUp(event);
    document.body.onblur = () => this.pressedKeys.clear();
  }

  // TODO: move timeouts to update function to follow execution flow
  private shiftTimeout: number | null = null;
  private shiftDirection: Direction.LEFT | Direction.RIGHT | null = null;
  private softDropTimeout: number | null = null;
  private async keyDown(event: KeyboardEvent) {
    if (this.pressedKeys.has(event.key)) return;
    this.pressedKeys.add(event.key);
    const action = this.controls.get(event.key);
    if (action === undefined) return;
    this.executeAction(action);
  }

  public executeAction(action: Action) {
    // TODO: encapsulate DAS/ARR/SDF numbers
    const DAS = 130, ARR = 10, SDF: number = 40;
    // TODO: maybe don't handle inputs with timing events
    switch (action) {
      case Action.MOVE_LEFT:
        if (this.shiftTimeout) clearInterval(this.shiftTimeout);
        this.shiftDirection = Direction.LEFT;
        this.activeMino.move(Direction.LEFT);
        this.shiftTimeout = setTimeout(() => {
          this.activeMino.move(Direction.LEFT);
          if (!ARR) while (this.activeMino.move(Direction.LEFT));
          this.shiftTimeout = setInterval(() => this.activeMino.move(Direction.LEFT), ARR);
        }, DAS);
        break;
      case Action.MOVE_RIGHT:
        if (this.shiftTimeout) clearInterval(this.shiftTimeout);
        this.shiftDirection = Direction.RIGHT;
        this.activeMino.move(Direction.RIGHT);
        this.shiftTimeout = setTimeout(() => {
          this.activeMino.move(Direction.RIGHT);
          if (!ARR) while (this.activeMino.move(Direction.RIGHT));
          this.shiftTimeout = setInterval(() => this.activeMino.move(Direction.RIGHT), ARR);
        }, DAS);
        break;
      case Action.SOFT_DROP:
        if (this.softDropTimeout) return;
        this.activeMino.move(Direction.DOWN);
        if (SDF == -1) this.softDropTimeout = setInterval(() => this.activeMino.move(Direction.DOWN), 0);
        else this.softDropTimeout = setInterval(() => this.activeMino.move(Direction.DOWN), 500 / SDF);
        break;
      case Action.HARD_DROP:
        this.activeMino.place();
        break;
      case Action.ROTATE_CW:
        this.activeMino.rotate(1);
        break;
      case Action.ROTATE_CCW:
        this.activeMino.rotate(-1);
        break;
      case Action.ROTATE_180:
        this.activeMino.rotate(2);
        break;
      case Action.HOLD:
        this.activeMino.holdPiece();
        break;
    }
  }

  private keyUp(event: KeyboardEvent) {
    this.pressedKeys.delete(event.key);
    const action = this.controls.get(event.key);
    if (this.softDropTimeout) {
      clearInterval(this.softDropTimeout);
      this.softDropTimeout = null;
    }
    if (this.shiftTimeout &&
      ((action == Action.MOVE_LEFT && this.shiftDirection == Direction.LEFT) ||
        (action == Action.MOVE_RIGHT && this.shiftDirection == Direction.RIGHT))) {
      clearInterval(this.shiftTimeout);
      this.shiftTimeout = null;
    }
  }

  public isPressed(action: Action) {
    return this.pressedKeys.has(this.controls.getKey(action) ?? "");
  }
}