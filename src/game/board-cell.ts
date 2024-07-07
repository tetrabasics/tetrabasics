import { Sprite, Container, Texture, BaseTexture, Rectangle, SCALE_MODES, Application } from 'pixi.js';
import { CellColor } from '../types';
import Game, { CELL_SIZE, GAME_SCALE } from './game';
import { IPoint, Point } from '../structures';
// TODO: dynamic import for textures
import grid from '/skin/gloss.png'
import loss from '/board/empty.png'

export default class BoardCell {
  public sprite: Sprite | null = null;
  // TODO: maybe using getters and setters isn't the best idea
  public isSolid = () => this.color != CellColor.NONE;
  get Color() { return this.color; }
  set Color(color: CellColor) {
    if (this.sprite) this.sprite.texture = BoardCell.getTexture(color != CellColor.NONE ? color : null);
    this.color = color;
  }
  constructor(
    game: Game,
    public point: Point,
    private color = CellColor.NONE,
    isVisible = true
  ) {
    if (!isVisible) return;
    this.sprite = new Sprite();
    this.Color = color;
    game.board.addChild(this.sprite);
    BoardCell.setCellCoordinates(game.app, this.sprite, point);
  }

  // TODO: make this available to some classes by export
  public static setCellCoordinates(app: Application, container: Container, point: IPoint) {
    // If the board displays incorrectly, this is the code to change
    container.x = point.x * CELL_SIZE;
    container.y = app.renderer.height - (point.y + 1) * CELL_SIZE;
  }

  // TODO: make this available to modules via export
  public static getTexture(color: CellColor | null): Texture {
    const texture = color === null ? new Texture(BaseTexture.from(loss)) :
      color == CellColor.NONE ? Texture.EMPTY :
        new Texture(BaseTexture.from(grid), new Rectangle(31 * color, 0, CELL_SIZE, CELL_SIZE));
    texture.baseTexture.scaleMode = SCALE_MODES.NEAREST;
    return texture;
  }
}