import { Logger } from './logger';
import { Tetris } from './tetris';
import { StartScreen } from './startScreen';

import { GAME_STATES } from './constants';

export class Game {
  constructor({ window, root, document, height, width, logLevel }) {
    this.logger = new Logger(logLevel);
    this.root = root;
    this.frameRate = 50; //20hertz in milliseconds
    this.handleInput = this.handleInput.bind(this);
    this.startingLevel = 1;
    this.scores = [
      { name: 'AAA', score: 9999 },
      { name: 'BBB', score: 8888 },
      { name: 'CCC', score: 7777 },
    ];
    this.gameState = GAME_STATES.STAGE_SELECT;
    this.window = window;
    this.attachElements(document, width, height);
    this.attachEvents(window);
    this.initTetris();
    this.initStartScreen();
  }

  startGame() {
    this.initTetris();
    this.gameState = GAME_STATES.ACTIVE_GAME;
    this.gameEngine.start();
  }

  init() {
    this.renderLoop = this.renderLoop.bind(this);
    this.renderLoop();
  }

  initStartScreen() {
    this.startScreen = new StartScreen({
      scores: this.scores,
      startingLevel: this.startingLevel,
      onNewLevelChosen: ({ level }) => {
        this.startingLevel = level;
      },
      onStartGame: ({ level }) => {
        this.startingLevel = level;
        this.startGame();
      },
    });
  }

  initTetris() {
    this.gameEngine = new Tetris({
      startingLevel: this.startingLevel,
      frameRate: this.frameRate,
      onGameOver: () => {
        this.logger.info(
          'This callback does not do anything, but happens when the game ends.'
        );
      },
      onExitGame: (finalScore = 0) => {
        this.exitGame({ finalScore });
      },
    });
  }

  exitGame(props) {
    const score = {
      name: 'P1',
      score: props.finalScore,
    };
    this.logger.info(`Recording score: ${score}`);
    this.scores = [score, ...this.scores];
    this.scores.sort((a, b) => b.score - a.score);
    this.scores = this.scores.slice(0, 3);
    this.startScreen.setScores(this.scores);
    this.gameState = GAME_STATES.STAGE_SELECT;
  }

  handleInput(e) {
    this.logger.debug('handleInput', e);
    let didHandle = false;
    if (this.isStartScreen()) {
      didHandle = didHandle || this.startScreen.handleInput(e.key);
    } else if (this.isGameRunning()) {
      didHandle = didHandle || this.gameEngine.handleInput(e.key);
    }

    if (!didHandle) {
      this.handleFreeInput(e);
    }
  }

  handleFreeInput(e) {
    this.logger.info('Unhandled input:', e);
    /**
     * @todo add input modes based on whether the game is started.
     */
    switch (e.key) {
    default:
      this.logger.info('Unhandled input:', e);
    }
  }

  renderLoop() {
    this.logger.trace('animating!');
    this.renderFrame();
    this.tick(Date.now());
    this.window.requestAnimationFrame(this.renderLoop);
  }

  tick(time) {
    // is Game Over?
    if (this.isGameRunning()) {
      this.logger.debug('game is running!');
      this.gameEngine.processTick(time);
    }

    if (this.isStartScreen()) {
      this.logger.debug('game is in start screen!');
      this.startScreen.processTick(time);
    }
  }

  isStartScreen() {
    return this.gameState === GAME_STATES.STAGE_SELECT;
  }

  isGameRunning() {
    return this.gameState !== GAME_STATES.STAGE_SELECT;
  }

  attachElements(document, width, height) {
    const canvas = document.createElement('canvas');
    canvas.height = height;
    canvas.width = width;
    this.ctx = canvas.getContext('2d');
    this.root.appendChild(canvas);
  }

  attachEvents(window) {
    window.addEventListener('keydown', e => {
      this.logger.trace(e.key, e.keyCode, e.code);
      this.handleInput(e);
    });
  }

  renderFrame(time) {
    this.lastFrame = time;
    this.logger.debug('Game rendering');

    if (this.isGameRunning()) {
      this.gameEngine.drawScreen(this.ctx);
    }

    if (this.isStartScreen()) {
      this.startScreen.drawScreen(this.ctx, {
        scores: this.scores,
      });
    }
  }
}
