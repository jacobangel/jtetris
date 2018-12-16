export const GRID_WIDTH = 10;
export const GRID_HEIGHT = 20;
export const CELL_SIZE = 30; //px

export class Game {
  constructor(props) {
    console.log('I was created');
  }

  renderFrame(time = 16) {
     console.log('Game rendering'); 
  }
}