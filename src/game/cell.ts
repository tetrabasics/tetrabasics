import { Sprite, Container, Texture, BaseTexture, Rectangle, SCALE_MODES, Application } from 'pixi.js';
import { CellColor } from '../types';
import Game, { CELL_SIZE, GAME_SCALE } from './game';
import { IPoint, Point } from '../structures';
// TODO: dynamic import for textures
import grid from '/skin/gloss.png'
import loss from '/board/empty.png'
import Board from './board';

export interface CellData {
  color: CellColor
  isSolid: boolean
  metadata: Metadata
}

// other data that a board cell might need to keep track of
export type Metadata = Partial<{
  isGlowing: boolean // TODO: make cells glow if this is true
}> | null;

export default class Cell {
  public sprite: Sprite | null = null;
  // TODO: maybe using getters and setters isn't the best idea
  public metadata: Metadata = null; // TODO: do i need to make this private? probably not
  public isSolid = () => this.color != CellColor.NONE;
  private color = CellColor.NONE;
  get Color() { return this.color; }
  set Color(color: CellColor) {
    if (this.sprite) this.sprite.texture = Cell.getTexture(color != CellColor.NONE ? color : null);
    this.color = color;
  }
  constructor(
    board: Board,
    app: Application<HTMLCanvasElement>,
    public point: Point,
    isVisible = true
  ) {
    if (!isVisible) return;
    this.sprite = new Sprite();
    board.container.addChild(this.sprite);
    Cell.setCellCoordinates(app, this.sprite, point);
  }

  // TODO: i need a better name for this
  public toData(): CellData {
    return {
      color: this.color,
      isSolid: this.isSolid(),
      metadata: { ...this.metadata } // TODO: deep copy this maybe
    };
  }

  // TODO: make this available to some classes by export
  public static setCellCoordinates(app: Application, container: Container, point: IPoint) {
    // If the board displays incorrectly, this is the code to change
    container.x = point.x * CELL_SIZE;
    container.y = app.renderer.height / app.stage.scale.y - (point.y + 1) * CELL_SIZE;
  }

  // TODO: make this available to modules via export
  public static getTexture(color: CellColor | null): Texture {
    const texture = color === null ? new Texture(BaseTexture.from(loss)) :
      color == CellColor.NONE ? Texture.EMPTY :
        new Texture(BaseTexture.from(grid), new Rectangle(31 * color, 0, CELL_SIZE, CELL_SIZE));
    texture.baseTexture.scaleMode = SCALE_MODES.NEAREST;
    return texture;
  }

  // swaps the states of two cells without changing references 
  public swap(otherCell: Cell) {
    [this.Color, otherCell.Color] = [otherCell.Color, this.Color];
    [this.metadata, otherCell.metadata] = [otherCell.metadata, this.metadata];
  }
}