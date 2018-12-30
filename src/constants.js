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
// P <=> IG
// IG => GO
// GO => SS
// SS => IG

export const TETRIS_STATES = {
  PAUSED: 'paused',
  GAME_OVER: 'game_over',
  ACTIVE_GAME: 'active_game',
  INACTIVE_GAME: 'inactive_game',
};

export const GAME_STATES = {
  STAGE_SELECT: 'stage_select',
  ACTIVE_GAME: 'active_game',
};
