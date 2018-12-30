import { Game } from './game';
import { FULL_HEIGHT, FULL_WIDTH } from './constants';
import { LOG_LEVELS } from './logger';

const game = new Game({
  root: document.querySelector('#root'),
  window,
  document,
  height: FULL_HEIGHT,
  width: FULL_WIDTH,
  logLevel: LOG_LEVELS.INFO,
});

game.init();
