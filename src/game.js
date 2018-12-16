export const GRID_WIDTH = 10;
export const GRID_HEIGHT = 20;
export const CELL_SIZE = 30; //px
export const moveMap = {
  'ArrowLeft': [-1, 0],
  'ArrowRight': [1, 0],
  'ArrowDown': [0, 1],
  'ArrowUp': [0, 0]
}

import { getRandomPiece } from './tetrimo';
import { Coord } from './coord';
import { drawPaused, drawBlock, drawGrid } from './canvasUtils';
import { debounce } from './debounce';

export class Tetris {
  constructor() {
    const cells = [];

    for (let i = 0; i < GRID_HEIGHT; i++) {
      cells.push([]);
      for (let j = 0; j < GRID_WIDTH; j++) {
        cells[i].push(null);
      }
    } 

    const pieces = [];

    this.state = {
      cells,
    }
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
    console.log(activeCopy);
    return !activeCopy.getCoords().some((coord) => {
      console.log(coord);
      return this.hasCollision(coord);
    });
  }

  rotatePiece(dir) {
    if (!this.activePiece) return;
    if (this.canRotate(dir)) {
      console.log('can rorate!!');
      this.activePiece.rotate(dir);
    } else console.log('cannot ratate');
  }

  hasCollision(cord) {
    if (cord.x < 0 || cord.x > GRID_WIDTH - 1) {
      return true;
    }
    if (cord.y > GRID_HEIGHT -1 || cord.y < 0) {
      return true;
    }

    return Boolean(this.state.cells[cord.y][cord.x]);
  }

  canMove(move) {
    if (!this.activePiece) return false;
    const proposedMove = this.activePiece.getCoords().map(point => {
      return Coord.transform(point, move);
    })
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
    for (let i = 0; i < this.state.cells.length; i++) {
      for (let j = 0; j < this.state.cells[i].length; j++) {
        let cell = this.state.cells[i][j];
        if (cell) {
          drawBlock(ctx, new Coord(j, i));
        }
      }
    }
  }

  drawPieces(ctx) {
    // get a piece at random.
    if (this.activePiece) {
      const coords = this.activePiece.getCoords();
      for (let coord of coords) {
        drawBlock(ctx, coord);
      }
    }
  }

  canFall() {
    const coords = this.activePiece.getCoords();
    const cells = (this.state.cells);
    console.log('cehecking can fall', coords.length);
    return this.canMove(moveMap['ArrowDown']);
  }

  commit () {
    if (!this.activePiece) {
      throw new Error('Cannot commit a piece that doesn\'t exist');
    } 

    const coords = this.activePiece.getCoords();
    for (let coord of coords) {
      this.state.cells[coord.y][coord.x] = true;
    }
    this.activePiece = null;
  }

  collapse() {
    // we need to count how many are collapsed for points!
    let removed = 0;
    for (let y = 0; y < this.state.cells.length; y++) {
      if (this.state.cells[y].every(Boolean)) {
        console.log('removing lines!~');
        // remove line
        this.state.cells.splice(y, 1);
        this.state.cells.unshift(Array(GRID_WIDTH).fill(null));
        removed++;
      }
    } 
  }

  checkBoard() {
  }
}

export class Game {
  constructor({ root, document }) {
    this.root = root;
    this.document = document;
    this.attachElements();
    this.frameRate = 50 //20hertz in milliseconds
    this.level = 1;
    this.countdown = this.getCountdown();
    this.gameOver = false;
    this.paused = false;
    this.handleInput = this.handleInput.bind(this);
    this.handleInput = debounce(this.handleInput, this.frameRate);

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
        console.log(`Unhandled input:`, e);
    }
  }

  getCountdown() {
    return this.frameRate * (11 - this.level);
  }

  tick(time) {
    // is Game Over?
    if (this.isGameOver()) {
      console.log('game over!');
      return;
    }

    // is Game Paused?
    if (this.isPaused()) {
      console.log('paused');
      this.renderFrame();
      return;
    }

    if (this.lastTick === undefined) this.lastTick = time;
    const delta = time - this.lastTick; 
    this.lastTick = time;
    this.countdown = this.countdown - delta;
    // console.log(`cd ${this.countdown}, tickTime: ${time}, delta: ${delta}`)
    if (this.countdown > 0) {
      // console.log('not yet');
      return;
    }

    if (this.countdown <= 0) {
      console.log('showing tick!');
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
    canvas.height = GRID_HEIGHT * CELL_SIZE;
    canvas.width = GRID_WIDTH * CELL_SIZE;
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
    console.log('Game rendering'); 
    drawGrid(this.ctx);
    this.gameEngine.drawPieces(this.ctx);
    this.gameEngine.drawFallen(this.ctx);
  }
}