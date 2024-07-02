import { IPoint } from './structures';

// this is numbered for skins to recognize the index of the texture
export enum CellColor {
  RED = 0,
  ORANGE = 1,
  YELLOW = 2,
  GREEN = 3,
  CYAN = 4,
  BLUE = 5,
  PURPLE = 6,
  GHOST = 7,
  HOLD = 8,
  GARBAGE = 9,
  UNBLOCKABLE = 10,
  DANGER = 11,
  NONE
}

export enum ValidMinoType {
  L = "l",
  J = "j",
  Z = "z",
  S = "s",
  T = "t",
  I = "i",
  O = "o",
}

export enum InvalidMinoType {
  NONE = "_"
}

export type MinoType = ValidMinoType | InvalidMinoType;

export const fenNameToColor: Record<MinoType | string, CellColor> = {
  z: CellColor.RED,
  s: CellColor.GREEN,
  t: CellColor.PURPLE,
  l: CellColor.ORANGE,
  i: CellColor.CYAN,
  o: CellColor.YELLOW,
  j: CellColor.BLUE,
  _: CellColor.NONE,
  "#": CellColor.GARBAGE
};

// this is numbered for cw/ccw rotation to be addition/subtraction
export enum Direction {
  UP = 0,
  RIGHT = 1,
  DOWN = 2,
  LEFT = 3,
}

export interface WallKicks {
  cw: IPoint[]
  ccw: IPoint[]
}

// the direction key indicates where the old rotation is before applying kick offsets
export const mainKickTable: Record<Direction, WallKicks> = {
  [Direction.UP]: {
    cw: [{ x: -1, y: 0 }, { x: -1, y: 1 }, { x: 0, y: -2 }, { x: -1, y: -2 }],
    ccw: [{ x: 1, y: 0 }, { x: 1, y: 1 }, { x: 0, y: -2 }, { x: 1, y: -2 }]
  },
  [Direction.RIGHT]: {
    cw: [{ x: 1, y: 0 }, { x: 1, y: -1 }, { x: 0, y: 2 }, { x: 1, y: 2 }],
    ccw: [{ x: 1, y: 0 }, { x: 1, y: -1 }, { x: 0, y: 2 }, { x: 1, y: 2 }]
  },
  [Direction.DOWN]: {
    cw: [{ x: 1, y: 0 }, { x: 1, y: 1 }, { x: 0, y: -2 }, { x: 1, y: -2 }],
    ccw: [{ x: -1, y: 0 }, { x: -1, y: 1 }, { x: 0, y: -2 }, { x: -1, y: -2 }]
  },
  [Direction.LEFT]: {
    cw: [{ x: -1, y: 0 }, { x: -1, y: -1 }, { x: 0, y: 2 }, { x: -1, y: 2 }],
    ccw: [{ x: -1, y: 0 }, { x: -1, y: -1 }, { x: 0, y: 2 }, { x: -1, y: 2 }]
  }
}

// the direction key indicates where the old rotation is before applying kick offsets
export const iKickTable: Record<Direction, WallKicks> = {
  [Direction.UP]: {
    cw: [{ x: -2, y: 0 }, { x: 1, y: 0 }, { x: -2, y: -1 }, { x: 1, y: 2 }],
    ccw: [{ x: -1, y: 0 }, { x: 2, y: 0 }, { x: -1, y: -2 }, { x: 2, y: -1 }]
  },
  [Direction.RIGHT]: {
    cw: [{ x: -1, y: 0 }, { x: 2, y: 0 }, { x: -1, y: 2 }, { x: 2, y: -1 }],
    ccw: [{ x: 2, y: 0 }, { x: -1, y: 0 }, { x: 2, y: 1 }, { x: -1, y: -2 }]
  },
  [Direction.DOWN]: {
    cw: [{ x: 2, y: 0 }, { x: -1, y: 0 }, { x: 2, y: 1 }, { x: -1, y: -2 }],
    ccw: [{ x: 1, y: 0 }, { x: -2, y: 0 }, { x: 1, y: -2 }, { x: -2, y: 1 }]
  },
  [Direction.LEFT]: {
    cw: [{ x: 1, y: 0 }, { x: -2, y: 0 }, { x: 1, y: -2 }, { x: -2, y: 1 }],
    ccw: [{ x: -2, y: 0 }, { x: 1, y: 0 }, { x: -2, y: -1 }, { x: 1, y: 2 }]
  }
}

export const flipKickTable: Record<Direction, IPoint[]> = {
  [Direction.UP]: [{ x: 0, y: 1 }, { x: 1, y: 1 }, { x: -1, y: 1 }, { x: 1, y: 0 }, { x: -1, y: 0 }],
  [Direction.RIGHT]: [{ x: 1, y: 0 }, { x: 1, y: 2 }, { x: 1, y: 1 }, { x: 0, y: -2 }, { x: 0, y: 1 }],
  [Direction.DOWN]: [{ x: 0, y: -1 }, { x: -1, y: -1 }, { x: 1, y: -1 }, { x: -1, y: 0 }, { x: 1, y: 0 }],
  [Direction.LEFT]: [{ x: -1, y: 0 }, { x: -1, y: 2 }, { x: -1, y: 1 }, { x: 0, y: -2 }, { x: 0, y: 1 }]
}

export interface MinoData {
  color: CellColor
  cursorOffset: IPoint
  pieceOffsets: IPoint[]
}

export const minoToData: Record<MinoType, MinoData> = {
  [ValidMinoType.L]: {
    color: CellColor.ORANGE,
    cursorOffset: { x: 0, y: 0 },
    pieceOffsets: [{ x: -1, y: 0 }, { x: 0, y: 0 }, { x: 1, y: 0 }, { x: 1, y: 1 }]
  },
  [ValidMinoType.J]: {
    color: CellColor.BLUE,
    cursorOffset: { x: 0, y: 0 },
    pieceOffsets: [{ x: -1, y: 1 }, { x: -1, y: 0 }, { x: 0, y: 0 }, { x: 1, y: 0 }]
  },
  [ValidMinoType.Z]: {
    color: CellColor.RED,
    cursorOffset: { x: 0, y: 0 },
    pieceOffsets: [{ x: -1, y: 1 }, { x: 0, y: 1 }, { x: 0, y: 0 }, { x: 1, y: 0 }]
  },
  [ValidMinoType.S]: {
    color: CellColor.GREEN,
    cursorOffset: { x: 0, y: 0 },
    pieceOffsets: [{ x: -1, y: 0 }, { x: 0, y: 0 }, { x: 0, y: 1 }, { x: 1, y: 1 }]
  },
  [ValidMinoType.T]: {
    color: CellColor.PURPLE,
    cursorOffset: { x: 0, y: 0 },
    pieceOffsets: [{ x: -1, y: 0 }, { x: 0, y: 0 }, { x: 0, y: 1 }, { x: 1, y: 0 }]
  },
  [ValidMinoType.O]: {
    color: CellColor.YELLOW,
    cursorOffset: { x: 0.5, y: 0.5 },
    pieceOffsets: [{ x: -0.5, y: 0.5 }, { x: -0.5, y: -0.5 }, { x: 0.5, y: -0.5 }, { x: 0.5, y: 0.5 }]
  },
  [ValidMinoType.I]: {
    color: CellColor.CYAN,
    cursorOffset: { x: 0.5, y: -0.5 },
    pieceOffsets: [{ x: -1.5, y: 0.5 }, { x: -0.5, y: 0.5 }, { x: 0.5, y: 0.5 }, { x: 1.5, y: 0.5 }]
  },
  [InvalidMinoType.NONE]: {
    color: CellColor.NONE,
    cursorOffset: { x: 0, y: 0 },
    pieceOffsets: []
  }
}