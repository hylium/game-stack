'use strict';

module.exports = {
  stack: {
    startAfterInit: true,
    plugins: []
  },
  hyperion: {
    log: {
      levels: {
        debug: 0,
        info: 1,
        warn: 2,
        request: 3,
        worker: 4,
        error: 5
      },
      colors: {
        debug: 'blue',
        info: 'green',
        warn: 'yellow',
        request: 'magenta',
        worker: 'grey',
        error: 'red'
      },
      envLevels: {
        development: 'verbose',
        test: 'warn',
        production: 'error'
      },
      console: {
        colorize: true,
        level: 0
      },
      transports: []
    }
  }
};
