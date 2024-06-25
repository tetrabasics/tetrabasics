import Board from './board';
import { Direction } from './types';

const board = new Board();
const board2 = new Board(10, 20, "____________________z#_#z#z#z#z#z#z_z#z#z#z#_#z#z#z#z#z#z#_#z#z#z#_#z#z_z#z#z#z#_#z#z#z#z#z#z_z#z#z#z#z#z#z_z#z#_#z#z#z#z#z#z#z#z_jjjjj#_#z#jjj_j#z#z#jjjjj#z#_#jjjj_#z#z#_jjjj#z#z#jjjjj#_#z#jjjjj_z#z#?jtsztltiitojztiijltoitlljti");

document.addEventListener("keydown", event => {
  event.key == "w" && (board.activeMino.move(Direction.UP), board2.activeMino.move(Direction.UP));
  event.key == "a" && (board.activeMino.move(Direction.LEFT), board2.activeMino.move(Direction.LEFT));
  event.key == "s" && (board.activeMino.move(Direction.DOWN), board2.activeMino.move(Direction.DOWN));
  event.key == "d" && (board.activeMino.move(Direction.RIGHT), board2.activeMino.move(Direction.RIGHT));
});