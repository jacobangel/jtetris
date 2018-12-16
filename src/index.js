// attach game loop
// handle controls 
// mount game board

import { Game } from './game';

let shouldRender = true;
let game = new Game({});
const setShouldRender = (val) => shouldRender = val;

const renderLoop = () => {
  if (shouldRender) {
    console.log('animating!');
    game.renderFrame();
  }
  window.requestAnimationFrame(renderLoop);
}

window.addEventListener('keydown', (e) => {
  console.log(e.key, e.keyCode, e.code);
  if (e.key === 'Escape') {
      setShouldRender(false);
  }
  if (e.key === 'Enter') {
      setShouldRender(true);
  }
});

const init = () => {
  renderLoop();
}

init();