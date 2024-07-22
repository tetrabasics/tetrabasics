import { InvalidMinoType, MinoType } from '../types';
import Game, { GAME_SCALE } from './game';
import { PieceWindow } from './queue';

const HOLD_SIZE = 0.75;
// TODO: do i even need this class? i could also put this state in active mino or game
export default class PieceHold {
  private window: PieceWindow;
  private currentPiece: MinoType = InvalidMinoType.NONE;

  constructor(private game: Game, private rootElement: HTMLElement) {
    this.window = new PieceWindow(rootElement, HOLD_SIZE * GAME_SCALE);
  }

  public swapPiece(newPiece: MinoType): MinoType {
    this.window.setPiece(newPiece);
    const oldPiece = this.currentPiece;
    this.currentPiece = newPiece;
    return oldPiece;
  }
}