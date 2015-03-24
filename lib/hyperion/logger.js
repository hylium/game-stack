'use strict';

var winston = require('winston'), _ = require('lodash'), GSObject = require('game-stack-object');

module.exports = GSObject.extend({

  /**
   * Initialize the log handler
   * @param {Object} options
   * @constructor
   */
  init: function(options) {
    var transports = [], logger = this;

    this.levels = options.envLevels;

    transports.push(new winston.transports.Console({
      level: options.console ? options.console.level : this.getLogLevel(),
      colorize: (options.console && options.console.colorize !== undefined ? options.console.colorize : true)
    }));

    if (options.transports && _.isArray(options.transports)) {
      transports.concat(options.transports);
    }

    winston.addColors(options.colors);

    this._winstonLogger = new winston.Logger({
      levels: options.levels,
      transports: transports
    });

    _.keys(this._winstonLogger.levels).forEach(function(level) {
      logger[level] = logger._winstonLogger[level];
    });
  },

  /**
   * Returns the current log level
   * @returns {*|console.info|Console.info}
   */
  getLogLevel: function() {
    return this.levels[process.env.NODE_ENV || 'development'] || winston.levels.info;
  }
});
