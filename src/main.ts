import Board from './game/game';
import { Direction } from './types';

// const board = new Board();
const board = new Board(10, 40, "______________________________________________________________________z__zz_____z___z_____z#z_z#z#z#z#z#z#z_z#z#_#z#z#z#z#z#z#z#z_jjjjj#_#z#jjj_j#z#z#jjjjj#z#_#jjjj_#z#z#_jjjj#z#z#jjjjj#_#z#jjjjj_z#z#?jtsztltiitojztiijltoitlljti");

document.addEventListener("keydown", event => {
  event.key == " " && (board.activeMino.move(Direction.UP))
  event.key == "a" && (board.activeMino.move(Direction.LEFT))
  event.key == "s" && (board.activeMino.move(Direction.DOWN))
  event.key == "d" && (board.activeMino.move(Direction.RIGHT))
  event.key == "l" && (board.activeMino.rotate(true));
  event.key == "k" && (board.activeMino.rotate(false));
  event.key == "w" && (board.activeMino.place());
});