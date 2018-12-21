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

import { getRandomPiece, Block, Tetrimo, TETRIMO_DIR } from './tetrimo';
import { Coord } from './coord';
import {
  drawPaused,
  drawBlock,
  drawGrid,
  fillFullScreen,
  drawLevelSelect,
  drawStartScreen,
  drawGameOver,
} from './canvasUtils';

export class Tetris {
  constructor({ startingLevel = 1, frameRate = 50 }) {
    this.frameRate = frameRate;
    this.startingLevel = startingLevel;
    this.rowsDropped = 0;
    this.score = 0;
    this.linesCleared = 0;
    // @todo add a count of "seen" pieces
    const cells = [];
    this.logger = new Logger(LOG_LEVELS.WARN);
    for (let i = 0; i < GRID_HEIGHT; i++) {
      cells.push([]);
      for (let j = 0; j < GRID_WIDTH; j++) {
        cells[i].push(null);
      }
    }
    this.cells = cells;
    this.pieceQueue = [this.getRandomPiece()];
    this.countdown = this.getCountdown();
    this.gameOver = false;
  }

  get level() {
    let earnedLevel = Tetris.computeEarnedLevel(this.linesCleared);
    return Math.max(this.startingLevel, earnedLevel);
  }

  // this is the original score:
  // return ( ( (21 +  3 * actualLevel) - rowsFreeFell) ) * Math.pow(linesCleared);
  static getPointsAward(actualLevel, linesCleared, rowsDropped) {
    const lineBonus = [0, 40, 100, 300, 1200];
    return lineBonus[linesCleared] * (actualLevel + 1) + rowsDropped; // is there a level zero??
  }

  static computeEarnedLevel(linesCleared) {
    if (linesCleared <= 0) {
      return 1;
    } else if (linesCleared > 0 && linesCleared <= 90) {
      return 1 + Math.floor((linesCleared - 1) / 10);
    }
    return 10;
  }

  start() {}
  /**
   * Countdown is how much time there is between each frame.
   */
  getCountdown() {
    return this.frameRate * (11 - this.level);
  }

  /**
   * 
   * Rough description of flow chart.
   * 
   * countdown = countdown - delta ?
   * countdown <= 0 ?
   * 
   * set countdown = 0.05 * (11 - level);
    active pice?
       no
       can spawn
          yes spawn piece
          no   game over
       yes
          can fall?
          no
            commit piece
            collapse board
          yes
            move piece down
     bewteen coutndown you can attempt to move
   */
  processTick(time) {
    if (this.lastTick === undefined) {
      this.lastTick = time;
    }

    const delta = time - this.lastTick;
    this.lastTick = time;
    this.countdown = this.countdown - delta;
    this.logger.info(
      `cd ${this.countdown}, tickTime: ${time}, delta: ${delta}`
    );
    if (this.countdown > 0) {
      return;
    }

    if (this.countdown <= 0) {
      this.logger.info('showing tick!');
    }
    this.countdown = this.getCountdown();

    if (!this.hasActivePiece()) {
      if (this.canSpawnNextPiece()) {
        this.addPiece();
        return;
      } else {
        this.endGame();
        return false;
      }
    }

    if (this.canFall()) {
      this.movePiece(moveMap['ArrowDown']);
    } else {
      this.commit();
    }
  }

  endGame() {
    this.gameOver = true;
  }

  getRandomPiece() {
    const piecePostion = [5 /**replace with math on width */, 0];
    const newPiece = getRandomPiece(piecePostion);
    return newPiece;
  }

  canSpawnNextPiece() {
    const piece = this.pieceQueue[0];
    return (
      !this.hasCollision(piece) && piece.getCoords().some(coord => coord.y > -1)
    );
  }

  addPiece() {
    this.pieceQueue.push(this.getRandomPiece());
    this.activePiece = this.pieceQueue.shift();
  }

  // left or right
  // it would be nice if the pieces could help us more. maybe i'mve doing
  // stuff int he wrong place.
  canRotate(activePiece, dir) {
    if (!activePiece) {
      return false;
    }
    return !activePiece
      .rotate(dir)
      .getCoords()
      .some(coord => {
        this.logger.info(coord);
        return this.hasCollision(coord);
      });
  }

  /**
   * This is a really ugly way to do this. We try to rotate,
   * if we can't then who cares, we just undo the rotation.
   * @param {TETRIMO_DIR} dir
   */
  tryToRotatePiece(dir) {
    if (!this.activePiece) {
      return;
    }
    if (!this.canRotate(this.activePiece, dir)) {
      this.activePiece.rotate(
        dir === TETRIMO_DIR.LEFT ? TETRIMO_DIR.RIGHT : TETRIMO_DIR.LEFT
      );
      this.logger.info('Could not rotate piece, undoing the rotation.');
    } else {
      this.logger.info('Rotation was accepted.');
    }
  }

  hasCollision(cord) {
    if (cord instanceof Tetrimo) {
      return cord.getCoords().some(this.hasCollision, this);
    }
    if (cord.x < 0 || cord.x > GRID_WIDTH - 1) {
      return true;
    }
    // I think i can take off the y check.
    if (cord.y > GRID_HEIGHT - 1) {
      return true;
    }

    if (cord.y < 0) {
      return false;
    }

    return Boolean(this.cells[cord.y][cord.x]);
  }

  canMove(move) {
    if (!this.activePiece) return false;
    const proposedMove = this.activePiece.getCoords().map(point => {
      return Coord.transform(point, move);
    });
    return !proposedMove.some(this.hasCollision, this);
  }

  movePiece(move, forced = false) {
    // should be using type script you dummy.
    if (this.canMove(move)) {
      if (forced) {
        this.rowsDropped += 1;
      }
      this.activePiece.move(move);
    }
    //this.checkCollisions();
    // this.checkLineMade();
  }

  hasActivePiece() {
    return Boolean(this.activePiece);
  }
  canFall() {
    const coords = this.activePiece.getCoords();
    this.logger.info('cehecking can fall', coords.length);
    return this.canMove(moveMap['ArrowDown']);
  }

  scoreLines(removed, dropped) {
    return Tetris.getPointsAward(this.level, parseInt(removed, 10), dropped);
  }

  commit() {
    if (!this.activePiece) {
      throw new Error("Cannot commit a piece that doesn't exist");
    }

    const coords = this.activePiece.getCoords();
    for (let coord of coords) {
      this.cells[coord.y][coord.x] = new Block(
        new Coord(coord.x, coord.y),
        this.activePiece.color
      );
    }

    // we need to count how many are collapsed for points!
    let removed = 0;
    for (let y = 0; y < this.cells.length; y++) {
      if (this.cells[y].every(Boolean)) {
        this.logger.info('removing lines!~');
        // remove line
        this.cells.splice(y, 1);
        this.cells.unshift(Array(GRID_WIDTH).fill(null));
        removed++;
      }
    }
    // this assumes that all scores are contiguous
    this.score += this.scoreLines(removed, this.rowsDropped);
    this.linesCleared += removed;
    // this would be cleaner somewhere else i think.
    this.rowsDropped = 0;
    this.activePiece = null;
  }

  drawFallen(ctx, cells) {
    for (let i = 0; i < cells.length; i++) {
      for (let j = 0; j < cells[i].length; j++) {
        let cell = cells[i][j];
        if (cell) {
          drawBlock(ctx, new Coord(j, i), cell.color);
        }
      }
    }
  }

  drawPiece(ctx) {
    // get a piece at random.
    if (this.activePiece) {
      const coords = this.activePiece.getCoords();
      for (let coord of coords) {
        drawBlock(ctx, coord, this.activePiece.color);
      }
    }
  }

  // this should be a helper...
  drawDash(ctx, { level, score, linesCleared }) {
    ctx.fillStyle = 'black';
    ctx.font = "12px 'Helvetica Neue', sans-serif";
    ctx.fillText(
      `Level: ${level}`,
      CELL_SIZE,
      CELL_SIZE * GRID_HEIGHT + CELL_SIZE
    );
    ctx.fillText(
      `Score: ${score}`,
      CELL_SIZE,
      CELL_SIZE * GRID_HEIGHT + CELL_SIZE * 2
    );
    ctx.fillText(
      `Cleared: ${linesCleared}`,
      CELL_SIZE,
      CELL_SIZE * GRID_HEIGHT + CELL_SIZE * 3
    );
  }

  drawNextPiece(ctx, nextPiece) {
    if (nextPiece) {
      const coords = nextPiece.getCoords();
      for (let coord of coords) {
        drawBlock(ctx, Coord.transform(coord, [8, 2]), nextPiece.color);
      }
    }
  }

  /**
   * @todo refactor the draw methods to abstract away the drawing methods.
   * too much duplications or empty pass through to the utils. Basically
   * should probably merge the game and tetris classes, and factor out
   * a view layer like a sane person, passing in the various state for
   * rendering so we can swap out all the math and stuff.
   */
  drawGame(ctx) {
    fillFullScreen(ctx, 'white');
    drawGrid(ctx);
    this.drawPiece(ctx, this.activePiece);
    this.drawFallen(ctx, this.cells);
    this.drawDash(ctx, {
      linesCleared: this.linesCleared,
      level: this.level,
      score: this.score,
    });
    this.drawNextPiece(ctx, this.pieceQueue[0]);
  }
}

export class Game {
  constructor({ root, document }) {
    this.logger = new Logger(LOG_LEVELS.WARN);
    this.root = root;
    this.document = document;
    this.attachElements();
    this.frameRate = 50; //20hertz in milliseconds
    this.handleInput = this.handleInput.bind(this);
    // this.handleInput = debounce(this.handleInput, this.frameRate / 4);
    this.startingLevel = 1;
    this.initGame();
  }

  startGame() {
    this.gameStarted = true;
    this.gameEngine.start();
  }

  initGame() {
    this.gameEngine = new Tetris({
      startingLevel: this.startingLevel,
      frameRate: this.frameRate,
    });
    this.gameOver = false;
    this.paused = false;
    this.gameStarted = false;
  }

  handleInput(e) {
    this.logger.info('handelInput', e);
    if (this.isGameOver()) {
      this.handleGameOverInput(e.key);
    } else if (this.isPaused()) {
      this.handlePausedInput(e.key);
    } else if (this.isGameStarted()) {
      this.handleGameInput(e.key);
    } else if (this.isWaitingToStart()) {
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
        // better to do generic handling.
        //this.gameEngine.tryToRotatePiece(TETRIMO_DIR.LEFT);
        break;
      case 'x':
        //this.gameEngine.tryToRotatePiece(TETRIMO_DIR.RIGHT);
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
    this.paused = false;
    this.gameOver = true;
    this.gameStarted = false;
  }

  moveLevelSelect(dir) {
    this.logger.info('moveSelect', dir);
  }

  isGameStarted() {
    return this.gameStarted;
  }

  isWaitingToStart() {
    return !this.isPaused() && !this.isGameStarted() && !this.isGameOver();
  }

  isPaused() {
    return this.paused;
  }

  isGameOver() {
    return this.gameEngine.gameOver;
  }

  pauseGame() {
    this.paused = true;
  }

  unpauseGame() {
    this.paused = false;
  }

  attachElements() {
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
