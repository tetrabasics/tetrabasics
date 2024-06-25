import Board from './board';
import { Direction } from './types';

// const board = new Board();
const board = new Board(10, 20, "______________________________________________________________________z__zz_____z___z_____z#z_z#z#z#z#z#z#z_z#z#_#z#z#z#z#z#z#z#z_jjjjj#_#z#jjj_j#z#z#jjjjj#z#_#jjjj_#z#z#_jjjj#z#z#jjjjj#_#z#jjjjj_z#z#?jtsztltiitojztiijltoitlljti");

document.addEventListener("keydown", event => {
  event.key == "w" && (board.activeMino.move(Direction.UP))
  event.key == "a" && (board.activeMino.move(Direction.LEFT))
  event.key == "s" && (board.activeMino.move(Direction.DOWN))
  event.key == "d" && (board.activeMino.move(Direction.RIGHT))
  event.key == "e" && (board.activeMino.rotate(true));
  event.key == "q" && (board.activeMino.rotate(false));
});