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
  private isPaused = false;
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
    if (this.isPaused) return;
    // TODO: encapsulate DAS/ARR/SDF numbers
    const DAS = 130, ARR = 10, SDF = -1;
    // TODO: maybe don't handle inputs with timing events
    switch (action) {
      // garbage code i threw from an old project
      case Action.MOVE_LEFT:
        if (this.controlEvents.onLeft.das) return;
        this.clearShiftRepeat(this.controlEvents.onLeft);
        this.clearShiftRepeat(this.controlEvents.onRight);
        this.activeMino.move(Direction.LEFT);
        this.controlEvents.onLeft.das = setTimeout(() => {
          this.activeMino.move(Direction.LEFT);
          if (!ARR) while (this.activeMino.move(Direction.LEFT));
          this.controlEvents.onLeft.delay = setInterval(() => !this.isPaused && this.activeMino.move(Direction.LEFT), ARR);
        }, DAS);
        break;
      case Action.MOVE_RIGHT:
        if (this.controlEvents.onRight.das) return;
        this.clearShiftRepeat(this.controlEvents.onLeft);
        this.clearShiftRepeat(this.controlEvents.onRight);
        this.activeMino.move(Direction.RIGHT);
        this.controlEvents.onRight.das = setTimeout(() => {
          this.activeMino.move(Direction.RIGHT);
          if (!ARR) while (this.activeMino.move(Direction.RIGHT));
          this.controlEvents.onRight.delay = setInterval(() => !this.isPaused && this.activeMino.move(Direction.RIGHT), ARR);
        }, DAS);
        break;
      case Action.SOFT_DROP:
        if (this.controlEvents.down) return;
        this.activeMino.move(Direction.DOWN);
        if (SDF != -1) this.controlEvents.down = setInterval(() => !this.isPaused && this.activeMino.move(Direction.DOWN), 500 / SDF);
        else this.controlEvents.down = setInterval(() => !this.isPaused && this.activeMino.move(Direction.DOWN), 0);
        break;
      // end of garbage
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
  private controlEvents: {
    onLeft: { das: number | null, delay: number | null },
    onRight: { das: number | null, delay: number | null },
    down: number | null
  } = { onLeft: { das: null, delay: null }, onRight: { das: null, delay: null }, down: null }

  private clearShiftRepeat(eventDirection: { das: number | null, delay: number | null }) {
    if (eventDirection.das) {
      clearTimeout(eventDirection.das);
      eventDirection.das = null;
    }
    if (eventDirection.delay) {
      clearTimeout(eventDirection.delay);
      eventDirection.delay = null;
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
    // garbage code i threw from an old project
    if (action == Action.MOVE_LEFT) this.clearShiftRepeat(this.controlEvents.onLeft);
    if (action == Action.MOVE_RIGHT) this.clearShiftRepeat(this.controlEvents.onRight);
    if (action == Action.SOFT_DROP) {
      if (this.controlEvents.down) clearInterval(this.controlEvents.down);
      this.controlEvents.down = null;
    }
  }

  public isPressed(action: Action) {
    return this.pressedKeys.has(this.controls.getKey(action) ?? "");
  }

  public pause() {
    this.isPaused = true;
  }
  public play() {
    this.isPaused = false;
  }
}