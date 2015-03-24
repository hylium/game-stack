'use strict';

var GSObject = require('game-stack-object'), Logger = require('./logger'), PluginManager = require('./plugin-manager');

/**
 * Core class for GameStack.
 * @type {Function}
 */
module.exports = GSObject.extend({

  /**
   * GameStack core initialization.
   * @param {Object} config
   * @constructor
   */
  init: function(config) {
    this.logger = new Logger(config.log);
    this.plugins = new PluginManager(this);
  }
});
