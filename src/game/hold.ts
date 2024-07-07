import { InvalidMinoType, MinoType } from '../types';
import Game from './game';
import { PieceWindow } from './queue';

// TODO: do i even need this class? i could also put this state in active mino or game
export default class PieceHold {
  private window: PieceWindow;
  private currentPiece: MinoType = InvalidMinoType.NONE;

  constructor(private game: Game, private rootElement: HTMLElement) {
    this.window = new PieceWindow(rootElement);
  }

  public swapPiece(newPiece: MinoType): MinoType {
    this.window.setPiece(newPiece);
    const oldPiece = this.currentPiece;
    this.currentPiece = newPiece;
    return oldPiece;
  }
}