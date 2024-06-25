import Board from './board';

const board = new Board();
const board2 = new Board(10, 20, "____________________z#_#z#z#z#z#z#z_z#z#z#z#_#z#z#z#z#z#z#_#z#z#z#_#z#z_z#z#z#z#_#z#z#z#z#z#z_z#z#z#z#z#z#z_z#z#_#z#z#z#z#z#z#z#z_jjjjj#_#z#jjj_j#z#z#jjjjj#z#_#jjjj_#z#z#_jjjj#z#z#jjjjj#_#z#jjjjj_z#z#?jtsztltiitojztiijltoitlljti");

document.addEventListener("keydown", event => event.key == "d" && (board.activeMino.moveDown(), board2.activeMino.moveDown()));