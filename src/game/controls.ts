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
    k: Action.ROTATE_CW,
    l: Action.ROTATE_CCW,
    i: Action.ROTATE_180,
    o: Action.HOLD,
    enter: Action.PAUSE
  });
  private pressedKeys = new Set<string>();
  constructor(game: Game, private activeMino: ActiveMino) {
    game.app.view.onkeydown = this.keyDown;
    game.app.view.onkeyup = this.keyUp;
  }

  // TODO: put these delaying methods somewhere else
  private FRAME = () => new Promise<void>(r => requestAnimationFrame(() => r()));
  private WAIT = (ms: number) => new Promise<void>(r => setTimeout(r, ms));
  private async keyDown(event: KeyboardEvent) {
    this.pressedKeys.add(event.key);
    const action = this.controls.get(event.key);
    if (action === undefined) return;
    switch (action) {
      case Action.MOVE_LEFT:
        this.activeMino.move(Direction.LEFT);
        break;
      default:
        break;
    }
  }
  
  private keyUp(event: KeyboardEvent) {
    this.pressedKeys.delete(event.key);
  }

  public isPressed(action: Action) {
    return this.pressedKeys.has(this.controls.getKey(action) ?? "");
  }
}