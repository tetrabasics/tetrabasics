import { IPoint } from '../structures'
import { MinoType } from '../types';
import { LineClearInfo } from './board';
import { CellData } from './cell';
import Game from './game'

// TODO: fill in potential events to fire
// TODO: implement GameEvent emits throughout the program
type Event = ActionEvent & MiscEvent;
type ActionEvent = {
  move: [IPoint]
  piecePlaced: [IPoint, MinoType]
  linesCleared: [LineClearInfo]
}
type MiscEvent = {
  gameOver: []
}

// The central for game events and fires off to observers when those events are emitted.
export default class GameEvents {
  constructor(private game: Game) { }
  private observers: Partial<{
    [K in keyof Event]: Set<(...args: Event[K]) => void>;
  }> = {};

  public add<K extends keyof Event>(eventName: K, callback: (...args: Event[K]) => void): (...args: Event[K]) => void {
    if (!this.observers[eventName]) {
      // @ts-ignore
      // TODO: why typescript is bitching about this line i have no idea, literally everything else works
      this.observers[eventName] = new Set<(...args: Event[K]) => void>();
    }
    this.observers[eventName].add(callback);
    return callback;
  }

  public remove<K extends keyof Event>(eventName: K, callback: (...args: Event[K]) => void): boolean {
    if (!this.observers[eventName]) return false;
    const isDeleted = this.observers[eventName].delete(callback);
    if (isDeleted && !this.observers[eventName].size) delete this.observers[eventName];
    return isDeleted;
  }

  public emit<K extends keyof Event>(eventName: K, ...args: Event[K]) {
    this.observers[eventName]?.forEach(observer => observer(...args));
  }

  public awaitEvent<K extends keyof Event>(eventName: K): Promise<Event[K]> {
    return new Promise(resolve => {
      const callback = (...args: Event[K]) => {
        this.remove(eventName, callback);
        resolve(args);
      }
      this.add(eventName, callback);
    })
  }
}