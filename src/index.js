// attach game loop
// handle controls
// mount game board
import { Logger, LOG_LEVELS } from './logger';
import { Game } from './game';

let shouldRender = true;
let game = new Game({
  root: document.querySelector('#root'),
  document,
});
const globalLogger = new Logger(LOG_LEVELS.WARN);

const setShouldRender = val => (shouldRender = val);

const renderLoop = () => {
  if (shouldRender) {
    globalLogger.trace('animating!');
    game.tick(Date.now());
  }
  window.requestAnimationFrame(renderLoop);
};

window.addEventListener('keydown', e => {
  globalLogger.trace(e.key, e.keyCode, e.code);
  game.handleInput(e);
});

const init = () => {
  renderLoop();
};

init();
