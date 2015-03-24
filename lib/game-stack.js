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
    // Config loading
    this.config = _.merge(require('./../config/default'), config);

    // Building core
    this.core = new Hyperion(this.config.hyperion);

    // Manifest
    var defaultManifest;
    try {
      defaultManifest = require('./../config/default.manifest');
    } catch (err) {
      this.core.logger.error('Unable to load default manifest : "%s"', err.message);
    }
    this.manifest = manifest || defaultManifest;

    // Automatic start
    if (this.config.stack.startAfterInit) {
      this.start();
    }
  },

  /**
   * Starts the stack
   * @returns {promise|*|Q.promise}
   */
  start: function() {
    var startTime = Date.now(), gameStack = this;
    this.core.logger.info('============ Launching GameStack ============\n'.blue);

    // Saving modules
    var modules = gameStack.manifest.modules;
    delete gameStack.manifest.modules;

    // Composing servers pack
    var deferred = Q.defer();
    glue.compose(gameStack.manifest, function(err, server) {
      if (err) {
        gameStack.core.logger.error('Failed Composing manifest with error : "%s"', err);
        return deferred.reject(err);
      }

      // Restore manifest
      gameStack.manifest.modules = modules;

      gameStack.server = server;

      // Register GameStack plugins
      gameStack.core.logger.info('Loaded plugins :'.cyan);
      async.series(_.map(modules, function(options, pluginName) {
        return function(next) {
          gameStack.server.register({
            register: gameStack.core.plugins.create(require(pluginName)),
            options: options
          }, next);
        };
      }), function(err) {
        if (err) {
          gameStack.core.logger.error('GameStack failed launching : %s', err.message);
          return deferred.reject(err);
        }

        // Starting server
        gameStack.server.start(function() {
          console.log('');
          gameStack.core.logger.info('GameStack launched in %s env in %s ms\n'.green, process.env.NODE_ENV, new Date().getTime() - startTime);
          gameStack.core.logger.info('Available servers :');

          gameStack.server.connections.forEach(function(s) {
            gameStack.core.logger.info('  %s [ %s ]', s.info.uri, s.settings.labels.join(' - '));
          });

          // Resolve start promise
          deferred.resolve();
        });
      });
    });

    return deferred.promise;
  }
});
