import { CELL_SIZE, BOARD_HEIGHT, BOARD_WIDTH } from './constants';
import { drawText } from './canvasUtils';
export const drawLevelSelect = (ctx, { blinking, levels, currentLevel }) => {
  //console.log(levels, currentLevel);
  // draw boxes with current levles
  // draw numbers inside
  // make the active one blink i guess?
  const rows = 2;
  const cols = (levels + 1) / rows;
  const selectWidth = CELL_SIZE * cols + cols;
  const selectHeight = CELL_SIZE * rows + rows;
  const startX = BOARD_WIDTH / 2 - selectWidth / 2;
  const startY = BOARD_HEIGHT * 0.65;
  ctx.fillStyle = 'gray';
  ctx.fillRect(startX, startY, selectWidth, selectHeight);
  ctx.lineWidth = 1.0;
  ctx.strokeStyle = 'black'; // line color
  ctx.beginPath();
  ctx.moveTo(startX, startY);
  for (let y = 0; y <= rows; y++) {
    ctx.moveTo(startX, startY + y * CELL_SIZE);
    ctx.lineTo(startX + cols * CELL_SIZE, startY + y * CELL_SIZE);
  }
  ctx.moveTo(startX, startY);
  for (let x = 0; x <= cols; x++) {
    ctx.moveTo(startX + x * CELL_SIZE, startY);
    ctx.lineTo(startX + x * CELL_SIZE, startY + rows * CELL_SIZE);
  }
  for (let i = 0; i <= levels; i++) {
    const row = i > levels / rows ? 1 : 0;
    const x = startX + (i % ((1 + levels) / rows)) * CELL_SIZE;
    const y = startY + row * CELL_SIZE;
    if (i === currentLevel && blinking) {
      drawText(ctx, i, x, y, CELL_SIZE, CELL_SIZE, i === currentLevel);
    } else if (i !== currentLevel) {
      drawText(ctx, i, x, y, CELL_SIZE, CELL_SIZE, i === currentLevel);
    }
  }
  ctx.stroke();
  drawText(
    ctx,
    'Choose Your Level',
    startX,
    startY - CELL_SIZE,
    selectWidth,
    CELL_SIZE,
    true
  );
};

export const drawHighScores = (ctx, { scores }) => {
  const rows = scores.length + 1;
  const scoreWidth = BOARD_WIDTH / 2;
  const scoreHeight = CELL_SIZE * rows + rows;
  const startX = BOARD_WIDTH / 2 - scoreWidth / 2;
  const startY = BOARD_HEIGHT * 0.25;
  ctx.fillStyle = 'gray';
  ctx.fillRect(startX, startY, scoreWidth, scoreHeight);
  ctx.lineWidth = 1.0;
  drawText(
    ctx,
    'High Scores!',
    startX,
    startY - CELL_SIZE,
    scoreWidth,
    true,
    true
  );
  scores.forEach((result, i) => {
    const { name, score } = result;
    drawText(ctx, `${name} - - - ${score}`, startX, startY + i * CELL_SIZE);
  });
};
