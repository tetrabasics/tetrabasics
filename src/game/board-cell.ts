import { Sprite, Container, Texture, BaseTexture, Rectangle, SCALE_MODES } from 'pixi.js';
import { CellColor } from '../types';
import Game, { CELL_SIZE } from './game';
import { IPoint, Point } from '../structures';
// TODO: dynamic import for textures
import grid from '/skin/gloss.png'
import loss from '/board/empty.png'

export default class BoardCell {
  public sprite: Sprite;
  // TODO: maybe using getters and setters isn't the best idea
  public isSolid = () => this.color != CellColor.NONE;
  get Color() { return this.color; }
  set Color(color: CellColor) {
    this.sprite.texture = BoardCell.getTexture(color);
    this.color = color;
  }
  constructor(
    game: Game,
    public point: Point,
    private color = CellColor.NONE,
  ) {
    this.sprite = new Sprite(BoardCell.getTexture(color));
    game.board.addChild(this.sprite);
    BoardCell.setCellCoordinates(this.sprite, point);
  }

  // TODO: make this available to some classes by export
  public static setCellCoordinates(container: Container, point: IPoint) {
    // If the board displays incorrectly, this is the code to change
    container.x = point.x * CELL_SIZE;
    // TODO: remove magic number 19
    container.y = (19 - point.y) * CELL_SIZE;
  }
  // TODO: same with this but bundle it, check if i even need this
  public static changeCellCoordinates(container: Container, point: IPoint) {
    container.x += point.x * CELL_SIZE;
    container.y += -point.y * CELL_SIZE;
  }

  // TODO: make this available to modules via export
  public static getTexture(color: CellColor): Texture {
    const texture = color == CellColor.NONE ?
      new Texture(BaseTexture.from(loss)) :
      new Texture(BaseTexture.from(grid), new Rectangle(31 * color, 0, CELL_SIZE, CELL_SIZE));
    texture.baseTexture.scaleMode = SCALE_MODES.NEAREST;
    return texture;
  }
}