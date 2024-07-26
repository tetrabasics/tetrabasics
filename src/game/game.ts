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
    rootElement: HTMLElement = document.getElementById("board")!,
    public readonly peekRows = 2
  ) {
    // TODO: start the game paused
    // game components
    const { holdDiv, boardDiv, queueDiv } = this.createComponents(rootElement);

    // handling board string
    const [cellString, queueString] = boardString?.split("?") ?? [];

    this.app = new Application<HTMLCanvasElement>({
      width: width * CELL_SIZE * GAME_SCALE,
      height: ((height / 2) + peekRows) * CELL_SIZE * GAME_SCALE
    });
    this.app.stage.scale = { x: GAME_SCALE, y: GAME_SCALE };
    boardDiv.appendChild(this.app.view);

    // initialize composite classes
    this.events = new GameEvents(this);
    this.queue = new PieceQueue(this, queueDiv, queueString);
    this.board = new Board(this, this.app, this.queue, cellString);
    this.hold = new PieceHold(this, holdDiv);
    this.activeMino = new ActiveMino(this, this.board, this.queue, this.hold);
    this.controls = new GameControls(this, this.activeMino);
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
    // can't resume if the game is over
    if (pauseType == PauseType.OFF && this.pauseType == PauseType.GAME_OVER) return;
    this.pauseType = pauseType;
    // TODO: additional pause shenanigans go here
  }
}