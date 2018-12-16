export const GRID_WIDTH = 10;
export const GRID_HEIGHT = 20;
export const CELL_SIZE = 30; //px

import { getRandomPiece } from './tetrimo';
import { Coord } from './coord';

const renderBoard = (height, width) => { }

const fillScreen = (ctx, color) => {
  ctx.fillStyle = color;
  ctx.fillRect(0, 0, CELL_SIZE * GRID_WIDTH, CELL_SIZE * GRID_HEIGHT);
}

const drawTextScreen = (ctx, message) => {
  fillScreen(ctx, 'gray');
  ctx.fillStyle ='black';
  ctx.font = '48px \'Helvetica Neue\', sans-serif';
  const textCenter = ctx.measureText(message).width / 2;
  const xCenter = CELL_SIZE * GRID_WIDTH / 2;
  ctx.fillText(message,  xCenter - textCenter, CELL_SIZE * GRID_HEIGHT / 2);
}

const drawPaused = (ctx) => {
  return drawTextScreen(ctx, 'PAUSED');
}

const drawGameOver = ctx => {
  return drawTextScreen(ctx, 'GAME OVER');
}

const drawBlock = (ctx, coord) => {
  ctx.fillStyle = 'gray';
  ctx.fillRect(coord.x * CELL_SIZE, coord.y * CELL_SIZE, CELL_SIZE, CELL_SIZE);
}

const drawGrid = (ctx) => {
  fillScreen(ctx, 'white');
  ctx.fillStyle = 'black'; // line color
  ctx.lineWidth = 1.0;
  ctx.beginPath();
  ctx.moveTo(0, 0);
  for (let y = 0; y <= GRID_HEIGHT; y++) {
    ctx.moveTo(0, y * CELL_SIZE);
    ctx.lineTo(GRID_WIDTH * CELL_SIZE, y * CELL_SIZE);
  } 
  ctx.moveTo(0, 0);
  for (let x = 0; x <= GRID_WIDTH; x++) {
    ctx.moveTo(x * CELL_SIZE, 0)
    ctx.lineTo(x * CELL_SIZE, GRID_HEIGHT * CELL_SIZE);
  }
  ctx.stroke();             

};

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

  movePiece(move) {
    // should be using type script you dummy.
    this.activePiece.move(move);
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
          console.log(`drawing cell! ${i} ${j}`);
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
    return coords.every((coord) => {
      const [x, y] = coord.toArray();
      console.log(`${x}, ${y}`);
      if (y + 1 > GRID_HEIGHT - 1) {
        return false;
      }
      const nextRow = cells[y + 1];
      if (!nextRow) {
        console.log('no next row');
        return false;
      }
      const nextSlot = cells[y+1][x];
      if (nextSlot) {
        console.log('next slow occupied');
        return false;
      }
      return true;
    })
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

const moveMap = {
  'ArrowLeft': [-1, 0],
  'ArrowRight': [1, 0],
  'ArrowDown': [0, 1],
  'ArrowUp': [0, 0]
}
const debounce = (fn, time) => {
  return (...args) => {

  console.log('tryin gto debounce', time);
  fn(...args);
  }
}
export class Game {
  constructor({ root, document }) {
    this.root = root;
    this.document = document;
    this.attachElements();
    this.gameEngine = new Tetris();
    this.gameEngine.start();
    this.frameRate = 50 //20hertz in milliseconds
    this.level = 1;
    this.countdown = this.getCountdown();
    this.gameOver = false;
    this.paused = false;
    this.handleInput = debounce(
      this.handleInput.bind(this), this.frameRate);
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
      console.log('showing tickt!');
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