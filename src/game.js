export const GRID_WIDTH = 10;
export const GRID_HEIGHT = 20;
export const CELL_SIZE = 30; //px

import { getRandomPiece } from './tetrimo';
const renderBoard = (height, width) => { }

const drawBlock = (ctx, coord) => {
  ctx.fillStyle = 'gray';
  console.log(`fill ${coord}`);
  ctx.fillRect(coord.x * CELL_SIZE, coord.y * CELL_SIZE, CELL_SIZE, CELL_SIZE);

}
const drawGrid = (ctx) => {
  ctx.fillStyle = 'black';
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
        cells[i].push([]);
      }
    } 

    const pieces = [];

    this.state = {
      pieces,
      cells,
    }
  }

  start() {
    this.addPiece();
  }

  addPiece() {
    const piecePostion = [ 5 /**replace with math on width */, 0];
    const newPiece = getRandomPiece(piecePostion);
    this.activePiece = newPiece;
    this.activePiecePostion = piecePostion;
  }

  movePiece(move) {
    // should be using type script you dummy.
    move = [0, 1];
    this.activePiece.move(move);
    //this.checkCollisions();
    // this.checkLineMade();
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

  checkBoard() {
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
  }
  getCountdown() {
    return 0.05 * (11 - this.level);
  }
  tick(time) {
    const delta = time - this.lastTick; 
    this.lastTick = time;
    if (this.isPaused()) {
      console.log('paused');
      return;
    }

    if (this.isGameOver()) {
      console.log('game over!');
      return;
    }
    // is Game Over?
    // is Game Paused?
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
  isPaused() { return false; }
  isGameOver() { return false; }
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
    this.lastFrame = time;
     console.log('Game rendering'); 
     drawGrid(this.ctx);
     this.gameEngine.drawPieces(this.ctx);
  }
}