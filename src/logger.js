export const LOG_LEVELS = {
  TRACE: 0,
  DEBUG: 1,
  INFO: 2,
  WARN: 3,
  ERROR: 4,
};
export class Logger {
  constructor(level = LOG_LEVELS.WARN) {
    this.loglevel = level;
  }

  trace(msg) {
    if (this.loglevel <= LOG_LEVELS.TRACE) {
      console.trace(msg);
    }
  }

  debug(msg) {
    if (this.loglevel <= LOG_LEVELS.DEBUG) {
      console.info(msg);
    }
  }

  info(msg) {
    if (this.loglevel <= LOG_LEVELS.INFO) {
      console.log(msg);
    }
  }

  warn(msg) {
    if (this.loglevel <= LOG_LEVELS.WARN) {
      console.warn(msg);
    }
  }

  error(msg) {
    if (this.loglevel <= LOG_LEVELS.ERROR) {
      console.error(msg);
    }
  }
}
