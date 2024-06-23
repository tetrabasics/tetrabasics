import { IPoint } from './structures';

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

export enum MinoType {
  L = "L",
  J = "J",
  Z = "Z",
  S = "S",
  T = "T",
  I = "I",
  O = "O",
  NONE = "NONE"
}

export const fenNameToColor: Record<string, CellColor> = {
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

export enum Direction {
  UP,
  RIGHT,
  DOWN,
  LEFT
}

export interface WallKicks {
  cw: IPoint[]
  ccw: IPoint[]
}

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
  [MinoType.L]: {
    color: CellColor.ORANGE,
    cursorOffset: { x: 0, y: 0 },
    pieceOffsets: [{ x: -1, y: 0 }, { x: 0, y: 0 }, { x: 1, y: 0 }, { x: 1, y: 1 }]
  },
  [MinoType.J]: {
    color: CellColor.BLUE,
    cursorOffset: { x: 0, y: 0 },
    pieceOffsets: [{ x: -1, y: 1 }, { x: -1, y: 0 }, { x: 0, y: 0 }, { x: 1, y: 0 }]
  },
  [MinoType.Z]: {
    color: CellColor.RED,
    cursorOffset: { x: 0, y: 0 },
    pieceOffsets: [{ x: -1, y: 1 }, { x: 0, y: 1 }, { x: 0, y: 0 }, { x: 1, y: 0 }]
  },
  [MinoType.S]: {
    color: CellColor.GREEN,
    cursorOffset: { x: 0, y: 0 },
    pieceOffsets: [{ x: -1, y: 0 }, { x: 0, y: 0 }, { x: 0, y: 1 }, { x: 1, y: 1 }]
  },
  [MinoType.T]: {
    color: CellColor.PURPLE,
    cursorOffset: { x: 0, y: 0 },
    pieceOffsets: [{ x: -1, y: 0 }, { x: 0, y: 0 }, { x: 0, y: 1 }, { x: 1, y: 0 }]
  },
  [MinoType.O]: {
    color: CellColor.YELLOW,
    cursorOffset: { x: 0.5, y: 0.5 },
    pieceOffsets: [{ x: -0.5, y: 0.5 }, { x: -0.5, y: -0.5 }, { x: 0.5, y: -0.5 }, { x: 0.5, y: 0.5 }]
  },
  [MinoType.I]: {
    color: CellColor.CYAN,
    cursorOffset: { x: 0.5, y: -0.5 },
    pieceOffsets: [{ x: -1.5, y: 0.5 }, { x: -0.5, y: 0.5 }, { x: 0.5, y: 0.5 }, { x: 1.5, y: 0.5 }]
  },
  [MinoType.NONE]: {
    color: CellColor.NONE,
    cursorOffset: { x: 0, y: 0 },
    pieceOffsets: []
  }
}