import { drawStartScreen } from "./canvasUtils";
import { LOG_LEVELS, Logger } from './logger';

export class StartScreen {
  constructor({ onStartGame, startingLevel }) {
    this.startGameCB = onStartGame;
    
    this.logger = new Logger(LOG_LEVELS.INFO);
    this.level = startingLevel || 1;
  }

  processTick(time) {
    this.logger.debug(`Processing an animation tick`);
  }

  moveLevelSelect(dir) {
    this.logger.info(`move level select dir: ${dir}`);
  }
 
  handleInput(key) {
    this.logger.info(`handle start input: '${key}'`);
    /**
     * @todo add input modes based on whether the game is started.
     */
    switch (key) {
      case 'ArrowLeft':
      case 'ArrowRight':
      case 'ArrowUp':
      case 'ArrowDown':
        this.moveLevelSelect(moveMap[key]);
        break;
      case 'z':
        break;
      case 'x':
        break;
      case 'Escape':
        break;
      case 'Enter':
        this.startGameCB({ level: this.level });
        break;
      default:
        this.logger.info(`Unhandled input:`, key);
        return false;
    }
    return true;
  }

  drawScreen(ctx, props) {
    drawStartScreen(ctx, { startingLevel: this.level });
  }
}