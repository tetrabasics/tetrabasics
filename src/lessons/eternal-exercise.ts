import Game from '../game/game';

export default async function eternalExercise() {
  // const board = new Board();
  // const board = new Board(10, 40, "______________________________________________________________________z__zz_____z___z_____z#z_z#z#z#z#z#z#z_z#z#_#z#z#z#z#z#z#z#z_jjjjj#_#z#jjj_j#z#z#jjjjj#z#_#jjjj_#z#z#_jjjj#z#z#jjjjj#_#z#jjjjj_z#z#?jtsztltiitojztiijltoitlljti");
  const game = new Game(10, 40);
  await writeText("game mechanics are not protectable");
}

async function writeText(text: string, textSpeed = 1) {
  const textBox = document.getElementById("text")!;
  textBox.textContent = "";
  for (const char of text) {
    textBox.textContent += char;
    await new Promise<void>(r => setTimeout(r, 50 * textSpeed));
  }
  // TODO: add continue button of some kind that triggers on space or some shit
}