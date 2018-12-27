export const GRID_WIDTH = 10;
export const GRID_HEIGHT = 20;
export const CELL_SIZE = 30; //px
export const DASHBOARD_HEIGHT = CELL_SIZE * 3;
export const SIDEBAR_WIDTH = CELL_SIZE * 5;
export const BOARD_HEIGHT = GRID_HEIGHT * CELL_SIZE;
export const BOARD_WIDTH = GRID_WIDTH * CELL_SIZE;
export const FULL_HEIGHT = BOARD_HEIGHT + DASHBOARD_HEIGHT;
export const FULL_WIDTH = BOARD_WIDTH + SIDEBAR_WIDTH;

export const moveMap = {
  ArrowLeft: [-1, 0],
  ArrowRight: [1, 0],
  ArrowDown: [0, 1],
  ArrowUp: [0, 0],
};

import { Logger, LOG_LEVELS } from './logger';
import { TETRIMO_DIR } from './tetrimo';
import {
  drawPaused,
  drawLevelSelect,
  drawStartScreen,
  drawGameOver,
} from './canvasUtils';

import { Tetris } from './tetris';
import { assert } from './assert';

// P <=> IG
// IG => GO
// GO => SS
// SS => IG
export const GAME_STATES = {
  PAUSED: 'paused',
  GAME_OVER: 'game_over',
  STAGE_SELECT: 'stage_select',
  ACTIVE_GAME: 'active_game',
}

export class Game {
  constructor({ root, document }) {
    this.logger = new Logger(LOG_LEVELS.WARN);
    this.root = root;
    this.frameRate = 50; //20hertz in milliseconds
    this.handleInput = this.handleInput.bind(this);
    this.startingLevel = 1;
    this.attachElements(document);
    this.initGame();
  }

  startGame() {
    this.gameState = GAME_STATES.ACTIVE_GAME;
    this.gameEngine.start();
  }

  initGame() {
    this.gameState = GAME_STATES.STAGE_SELECT;
    this.gameEngine = new Tetris({
      startingLevel: this.startingLevel,
      frameRate: this.frameRate,
      onGameOver: (finalScore = 0) => {
        this.endGame({ finalScore });
      }
    });
  }

  handleInput(e) {
    this.logger.info('handleInput', e);
    if (this.isGameOver()) {
      this.handleGameOverInput(e.key);
    } else if (this.isPaused()) {
      this.handlePausedInput(e.key);
    } else if (this.isGameStarted()) {
      this.handleGameInput(e.key);
    } else if (this.isStartScreen()) {
      this.handleStartInput(e.key);
    } else {
      this.handleFreeInput(e);
    }
  }

  handlePausedInput(key) {
    this.logger.info('handlePausedInput', key);
    switch (key) {
      case 'Escape':
        this.isPaused() ? this.unpauseGame() : this.pauseGame();
        break;

      default:
        this.handleFreeInput({ key });
    }
  }

  handleGameInput(key) {
    this.logger.info('handleGameInput', key);
    switch (key) {
      case 'ArrowLeft':
      case 'ArrowRight':
      case 'ArrowUp':
        this.gameEngine.movePiece(moveMap[key]);
        break;
      case 'ArrowDown':
        this.gameEngine.movePiece(moveMap[key], true);
        break;
      case 'z':
        // better to do generic handling.
        this.gameEngine.tryToRotatePiece(TETRIMO_DIR.LEFT);
        break;
      case 'x':
        this.gameEngine.tryToRotatePiece(TETRIMO_DIR.RIGHT);
        break;
      case 'Escape':
        this.pauseGame();
        break;
      case 'Enter':
        if (this.isPaused()) this.unpauseGame();
        if (this.isGameOver()) this.initGame();
        if (!this.isGameStarted()) this.startGame();
        break;
      default:
        this.handleFreeInput({ key });
    }
  }

  handleGameOverInput(key) {
    this.logger.info('handle game over input', key);
    switch (key) {
      case 'z':
      case 'x':
      case 'Esc':
      case 'Enter':
        this.initGame();

      default:
        this.logger.info('Unhandled input to game over.', key);
    }
  }

  handleStartInput(key) {
    this.logger.info(`handle start input:`, key);
    /**
     * @todo add input modes based on whether the game is started.
     */
    switch (key) {
      case 'ArrowLeft':
      case 'ArrowRight':
      case 'ArrowUp':
      case 'ArrowDown':
        this.moveLevelSelect(moveMap[key]);
        break;
      case 'z':
        break;
      case 'x':
        break;
      case 'Escape':
        break;
      case 'Enter':
        this.startGame();
        break;
      default:
        this.logger.info(`Unhandled input:`, key);
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
    if (this.isGameOver()) {
      this.logger.info('game over!');
      return;
    }

    // is Game Paused?
    if (this.isPaused()) {
      this.logger.info('paused');
      return;
    }

    if (!this.isGameStarted()) {
      this.logger.info('game is waiting to start!');
      return;
    }

    this.gameEngine.processTick(time);
  }

  endGame() {
    this.gameState = GAME_STATES.GAME_OVER;
  }

  moveLevelSelect(dir) {
    this.logger.info('moveSelect', dir);
  }

  isGameStarted() {
    return this.gameState === GAME_STATES.ACTIVE_GAME; 
  }

  isStartScreen() {
    return this.gameState === GAME_STATES.STAGE_SELECT;
  }

  isPaused() {
    return this.gameState === GAME_STATES.PAUSED;
  }

  isGameOver() {
    return this.gameState === GAME_STATES.GAME_OVER;
  }

  pauseGame() {
    this.gameState = GAME_STATES.PAUSED;
  }

  unpauseGame() {
    this.gameState = GAME_STATES.ACTIVE_GAME;
  }

  attachElements(document) {
    const canvas = document.createElement('canvas');
    canvas.height = GRID_HEIGHT * CELL_SIZE + DASHBOARD_HEIGHT;
    canvas.width = GRID_WIDTH * CELL_SIZE + SIDEBAR_WIDTH;
    this.ctx = canvas.getContext('2d');
    this.root.appendChild(canvas);
  }

  drawStartScreen(ctx) {
    drawStartScreen(ctx);
    drawLevelSelect(ctx, this.startingLevel);
  }

  renderFrame(time) {
    this.lastFrame = time;
    this.logger.info('Game rendering');

    if (this.isGameOver()) {
      drawGameOver(this.ctx);
      return;
    }

    if (this.isPaused()) {
      drawPaused(this.ctx);
      return;
    }

    if (this.isGameStarted()) {
      this.gameEngine.drawGame(this.ctx);
    } else {
      this.drawStartScreen(this.ctx);
    }
  }
}
