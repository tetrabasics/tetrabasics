import { CellColor, InvalidMinoType, MinoType } from '../types';
import Game, { GAME_SCALE } from './game';
import { PieceWindow } from './queue';

const HOLD_SIZE = 0.75;
export default class PieceHold {
  private window: PieceWindow;
  private currentPiece: MinoType = InvalidMinoType.NONE;
  // TODO: make this private? maybe
  public canHold = true;

  constructor(private game: Game, private rootElement: HTMLElement) {
    this.window = new PieceWindow(rootElement, HOLD_SIZE * GAME_SCALE);
  }

  public swapPiece(newPiece: MinoType): MinoType {
    this.canHold = false;
    this.window.setPiece(newPiece, CellColor.UNBLOCKABLE);
    const oldPiece = this.currentPiece;
    this.currentPiece = newPiece;
    return oldPiece;
  }

  public empty() {
    this.canHold = true;
    this.window.setPiece(InvalidMinoType.NONE);
    this.currentPiece = InvalidMinoType.NONE;
  }

  public free() {
    this.canHold = true;
    this.window.setPiece(this.currentPiece);
  }
}