import { Logger, LOG_LEVELS } from './logger';
import { TETRIMO_DIR } from './tetrimo';
import { drawPaused, drawStartScreen, drawGameOver } from './canvasUtils';

import { Tetris } from './tetris';
import { StartScreen } from './startScreen';

import {
  GAME_STATES,
  moveMap,
  GRID_HEIGHT,
  CELL_SIZE,
  DASHBOARD_HEIGHT,
  GRID_WIDTH,
  SIDEBAR_WIDTH,
} from './constants';

export class Game {
  constructor({ root, document }) {
    this.logger = new Logger(LOG_LEVELS.WARn);
    this.root = root;
    this.frameRate = 50; //20hertz in milliseconds
    this.handleInput = this.handleInput.bind(this);
    this.startingLevel = 1;
    this.scores = [];
    this.gameState = GAME_STATES.STAGE_SELECT;
    this.attachElements(document);
    this.initGame();
    this.initStartScreen();
  }

  startGame() {
    this.initGame();
    this.gameState = GAME_STATES.ACTIVE_GAME;
    this.gameEngine.start();
  }

  initStartScreen() {
    this.startScreen = new StartScreen({
      startingLevel: this.startingLevel,
      onStartGame: ({ level }) => {
        this.startingLevel = level;
        this.startGame() 
      },
    })
  }

  initGame() {
    this.gameEngine = new Tetris({
      startingLevel: this.startingLevel,
      frameRate: this.frameRate,
      onGameOver: (finalScore = 0) => {
        this.logger.info('This callback does not do anything.');
      },
      onExitGame: (finalScore = 0) => {
        this.exitGame({ finalScore });
      }
    });
  }

  exitGame(props) {
    const score = props.finalScore;
    this.logger.warn(`Recording score: ${score}`);
    this.scores = [score, ...this.scores];
    this.scores.sort((a, b) => b - a);
    // need to refactor so these don't share the same enum
    this.gameState = GAME_STATES.STAGE_SELECT;
  } 

  handleInput(e) {
    this.logger.info('handleInput', e);
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
    this.logger.info(`Unhandled input:`, e);
    /**
     * @todo add input modes based on whether the game is started.
     */
    switch (e.key) {
      default:
        this.logger.info(`Unhandled input:`, e);
    }
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

  attachElements(document) {
    const canvas = document.createElement('canvas');
    canvas.height = GRID_HEIGHT * CELL_SIZE + DASHBOARD_HEIGHT;
    canvas.width = GRID_WIDTH * CELL_SIZE + SIDEBAR_WIDTH;
    this.ctx = canvas.getContext('2d');
    this.root.appendChild(canvas);
  }


  renderFrame(time) {
    this.lastFrame = time;
    this.logger.debug('Game rendering');

    if (this.isGameRunning()) {
      this.gameEngine.drawScreen(this.ctx);
    }

    if (this.isStartScreen()) {
      this.startScreen.drawScreen(this.ctx);
    }
  }
}
