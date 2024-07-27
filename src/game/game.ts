import { Application, Container } from 'pixi.js';
import { HashMap, IPoint, Point } from '../structures';
import { fenNameToColor, CellColor, MinoType, ValidMinoType, PauseType } from '../types';
import ActiveMino from './active-mino';
import Cell, { CellData } from './cell';
import GameControls from './controls';
import PieceQueue from './queue';
import PieceHold from './hold';
import GameEvents from './events';
import Board from './board';

export const GAME_SCALE = 1;
export const CELL_SIZE = 30;

/* The main class that creates a game object. This contains the main game structure and composes key classes for functionality. */
export default class Game {
  // app
  // TODO: make these private except GameEvents
  public readonly app: Application<HTMLCanvasElement>;
  public readonly board: Board;
  public readonly controls: GameControls;
  public readonly events: GameEvents;

  constructor(
    public readonly width = 10,
    public readonly height = 40,
    // TODO: make options object
    boardString?: string,
    private rootElement: HTMLElement = document.getElementById("board")!,
    public readonly peekRows = 2
  ) {
    // TODO: start the game paused
    // game components
    const { holdDiv, boardDiv, queueDiv } = this.createComponents(rootElement);

    this.app = new Application<HTMLCanvasElement>({
      width: width * CELL_SIZE * GAME_SCALE,
      height: ((height / 2) + peekRows) * CELL_SIZE * GAME_SCALE
    });
    this.app.stage.scale = { x: GAME_SCALE, y: GAME_SCALE };
    boardDiv.appendChild(this.app.view);

    // initialize composite classes
    this.events = new GameEvents(this);
    this.queue = new PieceQueue(this, queueDiv);
    this.board = new Board(this, this.app, this.queue);
    this.hold = new PieceHold(this, holdDiv);
    this.activeMino = new ActiveMino(this, this.board, this.queue, this.hold);
    this.controls = new GameControls(this, this.activeMino);

    // handling board string
    const [cellString, queueString] = boardString?.split("?") ?? [];
    // this.setGameState({ cellString, queueString });
    
    this.pause(PauseType.OFF);
  }

  private createComponents(rootElement: HTMLElement) {
    const holdDiv = document.createElement("div");
    holdDiv.className = "board-hold";
    rootElement.appendChild(holdDiv);
    const boardDiv = document.createElement("div");
    boardDiv.className = "board-main";
    rootElement.appendChild(boardDiv);
    const queueDiv = document.createElement("div");
    queueDiv.className = "board-queue";
    rootElement.appendChild(queueDiv);
    return { holdDiv, boardDiv, queueDiv };
  }

  // main board state
  private activeMino: ActiveMino;
  private queue: PieceQueue;
  private hold: PieceHold;

  // pause state because sure
  private pauseType = PauseType.GAME_PAUSE;
  public isPaused = () => this.pauseType != PauseType.OFF;

  public play = () => this.pause(PauseType.OFF);
  public pause(pauseType = PauseType.GAME_PAUSE) {
    // can't resume if the game is over TODO: find a better system to override game over only when resetting
    if (this.pauseType == PauseType.GAME_OVER && pauseType != PauseType.GAME_PAUSE) return;
    this.pauseType = pauseType;
    if (pauseType == PauseType.GAME_OVER) {
      this.board.gameOver();
      this.events.emit("gameOver");
      this.activeMino.gameOver();
    }
    // TODO: additional pause shenanigans go here
  }

  // for setting up the game to start playing, use when resetting
  public reset = () => this.setGameState();
  public setGameState({ cellString, queueString }: Partial<GameStateOptions> = {}) {
    this.pause(PauseType.GAME_PAUSE);
    this.board.setCellsFromString(cellString);
    this.board.b2b = this.board.combo = 0;
    this.queue.setQueue(queueString);
    this.hold.empty();
    this.activeMino.generate(this.queue.next());
    this.pause(PauseType.OFF);
  }

  // TODO: this is called from board when lines are injected, so this is an intermediate function.
  // if i can get board and active mino to cross-reference each other, i can remove this
  public updateMino() {
    this.activeMino.displace(point => point)
  }
}

// TODO: put this at the top im too lazy
interface GameStateOptions {
  cellString: string
  queueString: string
}