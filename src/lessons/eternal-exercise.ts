import Game from '../game/game';
import { PauseType } from '../types';

export default async function eternalExercise() {
  // const board = new Board();
  // const board = new Board(10, 40, "______________________________________________________________________z__zz_____z___z_____z#z_z#z#z#z#z#z#z_z#z#_#z#z#z#z#z#z#z#z_jjjjj#_#z#jjj_j#z#z#jjjjj#z#_#jjjj_#z#z#_jjjj#z#z#jjjjj#_#z#jjjjj_z#z#?jtsztltiitojztiijltoitlljti");
  const game = new Game(10, 40);
  //@ts-ignore
  window.game = game;
  await writeText("hello fellow person! are you ready for the eternal exercise?");
  await wait(2000);
  await writeText("in the eternal exercise, you'll complete a 40 line sprint by only doing quads. if you clear lines any other way, you lose.");
  await wait(2000);
  await writeText("also, you'll have a limited amount of space to stack. choose where you place carefully!");
  await wait(2000);
  const textBox = document.getElementById("text")!;
  let count = 0;
  function reset() {
    textBox.innerHTML = `<p>Clear 40 lines with 10 quads only!<br>(<span id="quads">0</span>/10)</p>`
    count = 0;
    game.reset();
    for (let i = 0; i < 10; i++) game.board.injectRow();
  }
  reset();
  const clearEvent = game.events.add("linesCleared", async ({ linesCleared }) => {
    if (linesCleared == 4) {
      document.getElementById("quads")!.textContent = (++count).toString();
      if (count == 10) {
        game.events.remove("linesCleared", clearEvent);
        celebration(game);
      }
    } else {
      game.pause(PauseType.GAME_OVER);
      textBox.innerHTML = `Oh no! You accidentally cleared ${linesCleared} line${linesCleared == 1 ? "" : "s"} instead of 4! Try again.`
      await wait(1500);
      reset();
    }
  });
}

async function celebration(game: Game) {
  game.pause(PauseType.GAME_OVER);
  await writeText("congratulations! with your new expertise, you'll be ready to move on to t-spins soon!");
  await wait(2000);
  console.log("exiting game...")
}

async function writeText(text: string, textSpeed = 1) {
  const textBox = document.getElementById("text")!;
  textBox.textContent = "";
  for (const char of text) {
    textBox.textContent += char;
    await wait(50 * textSpeed);
  }
  // TODO: add continue button of some kind that triggers on space or some shit
}

const wait = async (ms: number) => new Promise(r => setTimeout(r, ms));