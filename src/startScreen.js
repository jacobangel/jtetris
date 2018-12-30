import { drawStartScreen } from './canvasUtils';
import { drawLevelSelect, drawHighScores } from './startScreenComponents';
import { LOG_LEVELS, Logger } from './logger';

const moveMap = {
  ArrowLeft: 'left',
  ArrowRight: 'right',
  ArrowUp: 'up',
  ArrowDown: 'down',
};

export class StartScreen {
  constructor({ onStartGame, startingLevel, totalLevels, onNewLevelChosen }) {
    this.startGameCB = onStartGame;
    this.logger = new Logger(LOG_LEVELS.INFO);
    this.level = startingLevel || 1;
    this.totalLevels = totalLevels || 10;
    this.onNewLevelChosenCb = onNewLevelChosen;
  }

  setScores(scores) {
    // yes this is dumb.
    this.scores = scores;
  }

  processTick(time) {
    this.logger.debug('Processing an animation tick');
    if (this.lastTime === undefined) {
      this.lastTime = time;
    }
    if (time - this.lastTime > 250) {
      this.blink = !this.blink;
      this.lastTime = time;
    }
  }

  moveLevelSelect(dir) {
    let level = this.level;
    const totalLevels = this.totalLevels;
    if (dir === 'right') {
      level++;
    } else if (dir === 'left') {
      level--;
    } else if (dir === 'up') {
      level -= 5;
    } else {
      level += 5;
    }
    if (level === -1) {
      level = totalLevels - 1;
    } else {
      level = Math.abs(level) % totalLevels;
    }
    this.handleNewLevelChosen(level);
  }

  handleNewLevelChosen(level) {
    this.level = level;
    this.onNewLevelChosenCb({ level });
  }

  handleInput(key) {
    this.logger.debug(`handle start input: '${key}'`);
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
      this.logger.info('Unhandled input:', key);
      return false;
    }
    return true;
  }

  drawScreen(ctx, props) {
    const { scores } = props;
    drawStartScreen(ctx, { startingLevel: this.level });
    drawLevelSelect(ctx, {
      levels: 9,
      currentLevel: this.level,
      blinking: this.blink,
    });
    drawHighScores(ctx, {
      scores,
    });
  }
}
