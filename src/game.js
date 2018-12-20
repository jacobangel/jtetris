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

import { getRandomPiece, Block, Tetrimo } from './tetrimo';
import { Coord } from './coord';
import { drawPaused, drawBlock, drawGrid, fillFullScreen, drawTextScreen, drawGameOver } from './canvasUtils';
// import { debounce } from './debounce';

export class Tetris {
  constructor() {
    this.startingLevel = 1;
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
  }

  get level() {
    let earnedLevel = Tetris.computeEarnedLevel(this.linesCleared);
    return Math.max(this.startingLevel, earnedLevel);
  }

  static getPointsAward(actualLevel, linesCleared, rowsDropped) {
    // this is the original score:
    // return ( ( (21 +  3 * actualLevel) - rowsFreeFell) ) * Math.pow(linesCleared);
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

  getRandomPiece() {
    const piecePostion = [5 /**replace with math on width */, 0];
    const newPiece = getRandomPiece(piecePostion);
    return newPiece;
  }

  start() {}

  canSpawnNextPiece() {
    const piece = this.pieceQueue[0];
    return !this.hasCollision(piece) && piece.getCoords().some(coord => coord.y > -1);
  }

  addPiece() {
    this.pieceQueue.push(this.getRandomPiece());
    this.activePiece = this.pieceQueue.shift();
  }

  // left or right
  // it would be nice if the pieces could help us more. maybe i'mve doing
  // stuff int he wrong place.
  canRotate(dir) {
    if (!this.activePiece) {
      return false;
    }
    return !this.activePiece
      .rotate(dir)
      .getCoords()
      .some(coord => {
        this.logger.info(coord);
        return this.hasCollision(coord);
      });
  }

  tryToRotatePiece(dir) {
    if (!this.activePiece) {
      return;
    }

    if (this.canRotate(dir)) {
      this.logger.info('can rotate!!');
    } else {
      this.activePiece.rotate(dir === 'left' ? 'right' : 'left');
      this.logger.info('cannot rotate');
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

  drawGameOver(ctx) {
    drawGameOver(ctx);
  }

  drawPaused(ctx) {
    // draw grey
    drawPaused(ctx);
  }

  drawFallen(ctx) {
    for (let i = 0; i < this.cells.length; i++) {
      for (let j = 0; j < this.cells[i].length; j++) {
        let cell = this.cells[i][j];
        if (cell) {
          drawBlock(ctx, new Coord(j, i), cell.color);
        }
      }
    }
  }

  drawPieces(ctx) {
    // get a piece at random.
    if (this.activePiece) {
      const coords = this.activePiece.getCoords();
      for (let coord of coords) {
        drawBlock(ctx, coord, this.activePiece.color);
      }
    }
  }

  canFall() {
    const coords = this.activePiece.getCoords();
    this.logger.info('cehecking can fall', coords.length);
    return this.canMove(moveMap['ArrowDown']);
  }

  scoreLines(removed) {
    return Tetris.getPointsAward(this.level, parseInt(removed, 10), 0);
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

  drawDash(ctx) {
    ctx.fillStyle = 'black';
    ctx.font = "12px 'Helvetica Neue', sans-serif";
    ctx.fillText(
      `Level: ${this.level}`,
      CELL_SIZE,
      CELL_SIZE * GRID_HEIGHT + CELL_SIZE
    );
    ctx.fillText(
      `Score: ${this.score}`,
      CELL_SIZE,
      CELL_SIZE * GRID_HEIGHT + CELL_SIZE * 2
    );
    ctx.fillText(
      `Cleared: ${this.linesCleared}`,
      CELL_SIZE,
      CELL_SIZE * GRID_HEIGHT + CELL_SIZE * 3
    );
  }
  drawNextPiece(ctx) {
    const nextPiece = this.pieceQueue[0];
    if (nextPiece) {
      const coords = nextPiece.getCoords();
      for (let coord of coords) {
        drawBlock(ctx, Coord.transform(coord, [8, 2]), nextPiece.color);
      }
    }
  }
  draw(ctx) {
    fillFullScreen(ctx, 'white');
    drawGrid(ctx);
    this.drawPieces(ctx);
    this.drawFallen(ctx);
    this.drawDash(ctx);
    this.drawNextPiece(ctx);
  }
  checkBoard() {}
}

export class Game {
  constructor({ root, document }) {
    this.logger = new Logger();
    this.root = root;
    this.document = document;
    this.attachElements();
    this.frameRate = 50; //20hertz in milliseconds
    this.handleInput = this.handleInput.bind(this);
    // this.handleInput = debounce(this.handleInput, this.frameRate / 4);
    this.startGame();
  }

  startGame() {
    this.level = 1;
    this.countdown = this.getCountdown();
    this.gameOver = false;
    this.paused = false;
    this.gameEngine = new Tetris();
    this.gameEngine.start();
  }

  handleInput(e) {
    switch (e.key) {
      case 'ArrowLeft':
      case 'ArrowRight':
      case 'ArrowDown':
      case 'ArrowUp':
        this.gameEngine.movePiece(moveMap[e.key]);
        break;
      case 'z':
        // better to do generic handling.
        this.gameEngine.tryToRotatePiece('left');
        break;
      case 'x':
        this.gameEngine.tryToRotatePiece('right');
        break;
      case 'Escape':
        this.pauseGame();
        break;
      case 'Enter':
        if (this.isPaused()) this.unpauseGame();
        if (this.isGameOver()) this.startGame();
        break;
      default:
        this.logger.info(`Unhandled input:`, e);
    }
  }

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

    if (!this.gameEngine.hasActivePiece()) {
      if (this.gameEngine.canSpawnNextPiece()) {
        this.gameEngine.addPiece();
        return;
      } else {
        this.gameOver = true;
        return;
      }
    }

    if (!this.gameEngine.canFall()) {
      this.gameEngine.commit();
    } else {
      this.gameEngine.movePiece(moveMap['ArrowDown']);
    }
  }

  isPaused() {
    return this.paused;
  }

  isGameOver() {
    return this.gameOver;
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

  renderFrame(time) {
    if (this.isGameOver()) {
      this.gameEngine.drawGameOver(this.ctx);
      return;
    }
    if (this.isPaused()) {
      this.gameEngine.drawPaused(this.ctx);
      return;
    }

    this.lastFrame = time;
    this.logger.info('Game rendering');
    this.gameEngine.draw(this.ctx);
  }
}
