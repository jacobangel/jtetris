// attach game loop
// handle controls 
// mount game board

import { Game } from './game';

let shouldRender = true;
let game = new Game({
  root: document.querySelector('#root'),
  document
});
const setShouldRender = (val) => shouldRender = val;

const renderLoop = () => {
  if (shouldRender) {
    console.log('animating!');
    game.tick(Date.now());
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