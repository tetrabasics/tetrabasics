import ActiveMino from './active-mino';
import Game from './game';

export default class GameControls {
  constructor(private game: Game, private activeMino: ActiveMino) {}
}