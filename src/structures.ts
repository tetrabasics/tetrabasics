import { Direction } from './types';

// Note: if two different objects have the same hash, one WILL override the other instead of making room
/* HashMap allows users to pass in a hash function to provide semantic equality between similar objects.
This class is primarily used for Point, since memory addresses are a bitch */
export class HashMap<K, V> {
  private map: Map<string, [K, V]>;

  constructor(private toHash: (key: K) => string, entries?: readonly (readonly [K, V])[] | null) {
    this.map = new Map(entries?.map(([key, value]) => [toHash(key), [key, value]]));
  }

  // TODO: if map gets any new methods, add it here
  public clear = () => this.map.clear()
  public delete = (key: K): boolean => this.map.delete(this.toHash(key));
  public entries = (): IterableIterator<[K, V]> => this.map.values();
  public forEach(callbackfn: (value: V, key: K, map: HashMap<K, V>) => void, thisArg?: any) {
    this.map.forEach(([key, value]) => callbackfn(value, key, this), thisArg);
  }
  public get = (key: K): V | undefined => this.map.get(this.toHash(key))?.[1];
  public has = (key: K): boolean => this.map.has(this.toHash(key));
  // using Generator type instead of IterableIterator because god forbid i write actual code
  public *keys(): Generator<K> {
    for (const [key] of this.map.values()) {
      yield key;
    }
  }
  public *values(): Generator<V> {
    for (const [_, value] of this.map.values()) {
      yield value;
    }
  }
  public set = (key: K, value: V) => this.map.set(this.toHash(key), [key, value]);
  public get size() { return this.map.size; }
}

// IPoint is meant to better store data points (i.e. kick tables) and such. To convert to the Point class, see Point constructor
export interface IPoint { x: number, y: number }

export class Point implements IPoint {
  public readonly x: number;
  public readonly y: number;
  public static readonly DELTAS: Record<Direction, IPoint> = {
    [Direction.UP]: { x: 0, y: 1 },
    [Direction.DOWN]: { x: 0, y: -1 },
    [Direction.LEFT]: { x: -1, y: 0 },
    [Direction.RIGHT]: { x: 1, y: 0 }
  }

  // TODO: i dont get overload constructors man
  constructor()
  constructor(point: IPoint);
  constructor(x: number, y: number);
  constructor(first: number | IPoint = { x: 0, y: 0 }, y?: number) {
    if (typeof first === "number") {
      this.x = first;
      this.y = y!;
    } else {
      this.x = first.x;
      this.y = first.y;
    }
  }

  public delta({ x: deltaX = 0, y: deltaY = 0 }: Partial<IPoint>): Point {
    return new Point(this.x + deltaX, this.y + deltaY);
  }

  public equals = (other: IPoint) => this.x == other.x && this.y == other.y;
}