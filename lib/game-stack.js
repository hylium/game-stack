'use strict';

var Hyperion = require('./hyperion'), _ = require('lodash'), GSObject = require('game-stack-object'),
  util = require('util'), Hapi = require('hapi'), Q = require('q'), async = require('async'), glue = require('glue');

/**
 * GameStack main object.
 * @type {Function}
 */
module.exports = GSObject.extend({
  /**
   * GameStack initialization.
   * @constructor
   */
  init: function GameStack(manifest, config) {
    var gameStack = this;

    // Config loading
    this.config = _.merge(require('./../config/default'), config);

    // Manifest
    var defaultManifest;
    try {
      defaultManifest = require('./../config/default.manifest');
    } catch (err) {
      console.error('Unable to load default manifest : "%s"', err.message);
    }
    this.manifest = manifest || defaultManifest;

    // Composing server
    this.server = null;
    var promise = Q.Promise(function(resolve, reject) {
      glue.compose(_.omit(gameStack.manifest, 'gameStack'), function(err, server) {
        if (err) {
          reject(err);
        } else {
          // Saving Hapi server into stack object
          gameStack.server = server;

          resolve();
        }
      });
    }).then(function() {
      gameStack.config.hyperion.gameStackPlugins = _.keys(gameStack.manifest.gameStack.plugins);
      return gameStack.registerPlugin(Hyperion, gameStack.config.hyperion).then(function() {
        gameStack.log('info', '============ Initializing GameStack ============\n'.blue);
        gameStack.log('info', 'Loaded plugins :'.cyan);
      });
    });

    // Registering game-stack plugins
    var plugins = gameStack.manifest.gameStack.plugins;
    promise = _.reduce(plugins, function(promise, pluginOptions, pluginName) {
      return promise.then(function() {
        return gameStack.registerPlugin(require(pluginName), pluginOptions).then(function() {
          gameStack.log('info', '  %s initialised', pluginName.cyan);
        }, function(err) {
          gameStack.log('error', ' %s failed to initialize\n', pluginName.yellow);
          throw err;
        })
      });
    }, promise).then(function() {
      gameStack.log('info', 'GameStack initialized with no errors\n'.green);
      gameStack.$emit('ready');
    });

    // Automatic start
    if (this.config.stack.startAfterInit) {
      promise = promise.then(function() {
        return gameStack.start();
      });
    }

    // Catching errors
    promise.catch(function(err) {
      gameStack.log('error', 'GameStack failed to initialize with error :');
      gameStack.log('error', err);
    });
  },

  /**
   * Starts the stack
   * @returns {promise|*|Q.promise}
   */
  start: function() {
    var startTime = Date.now(), gameStack = this;
    gameStack.log('info', '============ Launching GameStack ============\n'.blue);

    // Displaying errors in console
    gameStack.server.on('request-error', function(request, err) {
      gameStack.log('error', err);
    });

    // Starting server
    return Q.Promise(function(resolve, reject) {
      gameStack.server.start(function() {
        gameStack.log('info', 'GameStack launched in %s env in %s ms\n'.green, process.env.NODE_ENV, new Date().getTime() - startTime);
        gameStack.log('info', 'Available servers :');

        gameStack.server.connections.forEach(function(connection) {
          gameStack.log('info', '  %s [ %s ]', connection.info.uri, connection.settings.labels.join(' - '));
        });

        // Resolve start promise
        resolve();
      });
    });
  },

  registerPlugin: function(plugin, options) {
    var server = this.server;
    return Q.Promise(function(resolve, reject) {
      server.register({
        register: plugin,
        options: options
      }, function(err) {
        if (err) {
          reject(err);
        } else {
          resolve();
        }
      });
    });
  },

  log: function() {
    if (!this.server || !this.server.methods.hyperion || !this.server.methods.hyperion.log) {
      throw new Error('Logger is not available at this time. Are you sure that you initialised GameStack correctly ?');
    }
    this.server.methods.hyperion.log.apply(this.server, arguments);
  }
});
