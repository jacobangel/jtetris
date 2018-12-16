import { CELL_SIZE, GRID_WIDTH, GRID_HEIGHT } from './game';
const fillScreen = (ctx, color) => {
  ctx.fillStyle = color;
  ctx.fillRect(0, 0, CELL_SIZE * GRID_WIDTH, CELL_SIZE * GRID_HEIGHT);
};
const drawTextScreen = (ctx, message) => {
  fillScreen(ctx, 'gray');
  ctx.fillStyle = 'black';
  ctx.font = '48px \'Helvetica Neue\', sans-serif';
  const textCenter = ctx.measureText(message).width / 2;
  const xCenter = CELL_SIZE * GRID_WIDTH / 2;
  ctx.fillText(message, xCenter - textCenter, CELL_SIZE * GRID_HEIGHT / 2);
};
export const drawPaused = (ctx) => {
  return drawTextScreen(ctx, 'PAUSED');
};
const drawGameOver = ctx => {
  return drawTextScreen(ctx, 'GAME OVER');
};
export const drawBlock = (ctx, coord) => {
  ctx.fillStyle = 'gray';
  ctx.fillRect(coord.x * CELL_SIZE, coord.y * CELL_SIZE, CELL_SIZE, CELL_SIZE);
};
export const drawGrid = (ctx) => {
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
    ctx.moveTo(x * CELL_SIZE, 0);
    ctx.lineTo(x * CELL_SIZE, GRID_HEIGHT * CELL_SIZE);
  }
  ctx.stroke();
};
