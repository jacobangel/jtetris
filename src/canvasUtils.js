import {
  CELL_SIZE,
  GRID_WIDTH,
  GRID_HEIGHT,
  FULL_HEIGHT,
  FULL_WIDTH,
} from './game';


export const fillFullScreen = (ctx, color) => {
  ctx.fillStyle = color;
  ctx.fillRect(0, 0, FULL_WIDTH, FULL_HEIGHT);
};

export const fillScreen = (ctx, color) => {
  ctx.fillStyle = color;
  ctx.fillRect(0, 0, CELL_SIZE * GRID_WIDTH, CELL_SIZE * GRID_HEIGHT);
};

export const drawLevelSelect = (ctx, levels, currentLevel) => {
  // console.log(levels, currentLevel);
}

export const drawStartScreen = (ctx) => {
  drawTextScreen(ctx, 'Press Enter to start!');
}

export const drawTextScreen = (ctx, message) => {
  fillScreen(ctx, 'gray');
  ctx.fillStyle = 'black';
  ctx.font = "24px 'Roboto Slab', sans-serif";
  const textCenter = ctx.measureText(message).width / 2;
  const xCenter = (CELL_SIZE * GRID_WIDTH) / 2;
  ctx.fillText(message, xCenter - textCenter, (CELL_SIZE * GRID_HEIGHT) / 2);
};

export const drawGameOver = ctx => {
  drawTextScreen(ctx, 'GAME OVER');
};

export const drawPaused = ctx => {
  drawTextScreen(ctx, 'PAUSED');
};

export const drawBlock = (ctx, coord, color = 'gray') => {
  ctx.fillStyle = '#555';
  ctx.fillRect(coord.x * CELL_SIZE, coord.y * CELL_SIZE, CELL_SIZE, CELL_SIZE);
  ctx.fillStyle = color;
  ctx.fillRect(
    coord.x * CELL_SIZE + 1,
    coord.y * CELL_SIZE + 1,
    CELL_SIZE - 2,
    CELL_SIZE - 2
  );
  const thicknss = 12;
  ctx.fillStyle = 'rgba(255,255,255, .3)';
  ctx.fillRect(
    coord.x * CELL_SIZE + thicknss / 2,
    coord.y * CELL_SIZE + thicknss / 2,
    CELL_SIZE - thicknss,
    CELL_SIZE - thicknss
  );
};
export const drawBorder = ctx => {
  ctx.lineWidth = 1.0;
  ctx.strokeStyle = 'black'; // line color
  ctx.beginPath();
  ctx.moveTo(0, 0);
  ctx.lineTo(0, GRID_HEIGHT * CELL_SIZE);
  ctx.lineTo(GRID_WIDTH * CELL_SIZE, GRID_HEIGHT * CELL_SIZE);
  ctx.lineTo(GRID_WIDTH * CELL_SIZE, 0);
  ctx.lineTo(0, 0);
  ctx.stroke();
};

export const drawGrid = ctx => {
  ctx.lineWidth = 1.0;
  ctx.strokeStyle = '#CCC'; // line color
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
  drawBorder(ctx);
};

export const drawDash = (ctx, { level, score, linesCleared }) => {
  ctx.fillStyle = 'black';
  ctx.font = "12px 'Helvetica Neue', sans-serif";
  ctx.fillText(`Level: ${level}`, CELL_SIZE, CELL_SIZE * GRID_HEIGHT + CELL_SIZE);
  ctx.fillText(`Score: ${score}`, CELL_SIZE, CELL_SIZE * GRID_HEIGHT + CELL_SIZE * 2);
  ctx.fillText(`Cleared: ${linesCleared}`, CELL_SIZE, CELL_SIZE * GRID_HEIGHT + CELL_SIZE * 3);
} 