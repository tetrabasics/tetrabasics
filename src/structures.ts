// Note: if two different objects have the same hash, one WILL override the other instead of making room
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
    for (const value of this.map.values()) {
      yield value[0];
    }
  }
  public *values(): Generator<V> {
    for (const value of this.map.values()) {
      yield value[1];
    }
  }
  public set = (key: K, value: V) => this.map.set(this.toHash(key), [key, value]);
  public get size() { return this.map.size; }
}

// IPoint is meant to better store data points (i.e. kick tables) and such. To convert to the Point class, see Point.from
export interface IPoint { x: number, y: number }

export class Point implements IPoint {
  constructor(public readonly x: number, public readonly y: number) { }

  public delta(deltaX: number = 0, deltaY: number = 0): Point {
    return new Point(this.x + deltaX, this.y + deltaY);
  }

  public static from = ({ x, y }: IPoint) => new Point(x, y);
}