export const GRID_WIDTH = 10;
export const GRID_HEIGHT = 20;
export const CELL_SIZE = 30; //px
export const DASHBOARD_HEIGHT = CELL_SIZE * 3;
export const SIDEBAR_WIDTH = CELL_SIZE * 3;
export const BOARD_HEIGHT = GRID_HEIGHT * CELL_SIZE;
export const BOARD_WIDTH = GRID_WIDTH * CELL_SIZE;
export const FULL_HEIGHT = BOARD_HEIGHT + DASHBOARD_HEIGHT;
export const FULL_WIDTH = BOARD_WIDTH + SIDEBAR_WIDTH;
export const moveMap = {
  'ArrowLeft': [-1, 0],
  'ArrowRight': [1, 0],
  'ArrowDown': [0, 1],
  'ArrowUp': [0, 0]
}

import { Logger } from './logger';

import { getRandomPiece, Block } from './tetrimo';
import { Coord } from './coord';
import { drawPaused, drawBlock, drawGrid, fillFullScreen } from './canvasUtils';
// import { debounce } from './debounce';

export class Tetris {
  constructor() {
    this.level = 1;
    this.score = 0;
    this.linesCleared = 0;
    // @todo add a count of "seen" pieces
    const cells = [];
    this.logger = new Logger()
    for (let i = 0; i < GRID_HEIGHT; i++) {
      cells.push([]);
      for (let j = 0; j < GRID_WIDTH; j++) {
        cells[i].push(null);
      }
    } 

    this.cells = cells;
  }

  start() {
  }

  canSpawnPiece() {
    return true;
  }

  addPiece() {
    const piecePostion = [ 5 /**replace with math on width */, 0];
    const newPiece = getRandomPiece(piecePostion);
    this.activePiece = newPiece;
    this.activePiecePostion = piecePostion;
  }

  // left or right
  // it would be nice if the pieces could help us more. maybe i'mve doing
  // stuff int he wrong place.
  canRotate(dir) {
    if (!this.activePiece) return false;
    let activeCopy = this.activePiece.getCopy(); 
    activeCopy = activeCopy.rotate(dir);
    this.logger.info(activeCopy);
    return !activeCopy.getCoords().some((coord) => {
      this.logger.info(coord);
      return this.hasCollision(coord);
    });
  }

  rotatePiece(dir) {
    if (!this.activePiece) return;
    if (this.canRotate(dir)) {
      this.logger.info('can rorate!!');
      this.activePiece.rotate(dir);
    } else this.logger.info('cannot ratate');
  }

  hasCollision(cord) {
    if (cord.x < 0 || cord.x > GRID_WIDTH - 1) {
      return true;
    }
    if (cord.y > GRID_HEIGHT -1 || cord.y < 0) {
      return true;
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

  movePiece(move) {
    // should be using type script you dummy.
    if (this.canMove(move)) {
      this.activePiece.move(move);
    }
    //this.checkCollisions();
    // this.checkLineMade();
  }

  hasActivePiece() {
    return Boolean(this.activePiece);
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
    const cells = (this.cells);
    this.logger.info('cehecking can fall', coords.length);
    return this.canMove(moveMap['ArrowDown']);
  }

  commit () {
    if (!this.activePiece) {
      throw new Error('Cannot commit a piece that doesn\'t exist');
    } 

    const coords = this.activePiece.getCoords();
    for (let coord of coords) {
      this.cells[coord.y][coord.x] = new Block(new Coord(coord.x, coord.y), this.activePiece.color);
    }
    this.activePiece = null;
  }

  scoreLines(removed) {
    return this.level * removed * removed;
  }

  collapse() {
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
    this.score += this.scoreLines(removed);
    this.linesCleared += removed;
  }

  drawDash(ctx) {
    ctx.fillStyle = 'black';
    ctx.font = '12px \'Helvetica Neue\', sans-serif';
    ctx.fillText(`Level: ${this.level}`, CELL_SIZE, CELL_SIZE * GRID_HEIGHT + CELL_SIZE);
    ctx.fillText(`Score: ${this.score}`, CELL_SIZE, CELL_SIZE * GRID_HEIGHT + CELL_SIZE * 2);
    ctx.fillText(`Cleared: ${this.linesCleared}`, CELL_SIZE, CELL_SIZE * GRID_HEIGHT + CELL_SIZE * 3);
  }

  checkBoard() {
  }
}

export class Game {
  constructor({ root, document }) {
    this.logger = new Logger();
    this.root = root;
    this.document = document;
    this.attachElements();
    this.frameRate = 50 //20hertz in milliseconds
    this.level = 1;
    this.countdown = this.getCountdown();
    this.gameOver = false;
    this.paused = false;
    this.handleInput = this.handleInput.bind(this);
    // this.handleInput = debounce(this.handleInput, this.frameRate / 4);
    this.gameEngine = new Tetris();
    this.gameEngine.start();
  }

  handleInput(e) {
    switch(e.key) {
      case 'ArrowLeft':
      case 'ArrowRight':
      case 'ArrowDown':
      case 'ArrowUp':
        this.gameEngine.movePiece(moveMap[e.key]);
        break;
      case 'z':
        // better to do generic handling.
        this.gameEngine.rotatePiece('left');
        break;
      case 'x':
        this.gameEngine.rotatePiece('right');
        break;
      case 'Escape':
        this.gameEngine.pauseGame();
        break;
      case 'Enter':
        this.gameEngine.unpauseGame();
        break;
      default:
        this.logger.info(`Unhandled input:`, e);
    }
  }

  getCountdown() {
    return this.frameRate * (11 - this.level);
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
      this.renderFrame();
      return;
    }

    if (this.lastTick === undefined) this.lastTick = time;
    const delta = time - this.lastTick; 
    this.lastTick = time;
    this.countdown = this.countdown - delta;
    // this.logger.info(`cd ${this.countdown}, tickTime: ${time}, delta: ${delta}`)
    if (this.countdown > 0) {
      // this.logger.info('not yet');
      return;
    }

    if (this.countdown <= 0) {
      this.logger.info('showing tick!');
    }
    this.countdown = this.getCountdown();
    if (!this.gameEngine.hasActivePiece()) {
      if (this.gameEngine.canSpawnPiece()) {
        this.gameEngine.addPiece();
      } else {
        this.gameOver = true;
        return;
      }
    }
    if (!this.gameEngine.canFall()) {
      this.gameEngine.commit();
      this.gameEngine.collapse();
    } else {
      this.gameEngine.movePiece(moveMap['ArrowDown']);
    }
    // countdown = countdown - delta ?
    // countdown <= 0 ?
    // 
    // set countdown = 0.05 * (11 - level);
    // active pice?
    //   no
    //   can spawn 
    //      yes spawn piece
    //      no   game over
    //   yes
    //      can fall? 
    //      no 
    //        commit piece
    //        collapse board 
    //      yes 
    //        move piece down

    // bewteen coutndown you can attempt to move
    this.renderFrame();
  }

  isPaused() { return this.paused; }

  isGameOver() { return this.gameOver; }

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

  renderBoard(height, width) {
    
  }

  renderFrame(time) {
    if (this.isGameOver()) {
      this.gameEngine.drawGameOver();
      return;
    }
    if (this.isPaused()) {
      this.gameEngine.drawPaused(this.ctx);
      return;
    }

    this.lastFrame = time;
    this.logger.info('Game rendering'); 
    fillFullScreen(this.ctx, 'white');
    drawGrid(this.ctx);
    this.gameEngine.drawPieces(this.ctx);
    this.gameEngine.drawFallen(this.ctx);
    this.gameEngine.drawDash(this.ctx);
  }
}