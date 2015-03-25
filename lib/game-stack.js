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

    // Manifest
    var defaultManifest;
    try {
      defaultManifest = require('./../config/default.manifest');
    } catch (err) {
      console.error('Unable to load default manifest : "%s"', err.message);
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

    // Saving modules
    var modules = gameStack.manifest.modules;
    delete gameStack.manifest.modules;

    // Composing servers pack
    var deferred = Q.defer();
    glue.compose(gameStack.manifest, function(err, server) {
      if (err) {
        return deferred.reject(err);
      }

      // Restore manifest
      gameStack.manifest.modules = modules;

      // Saving Hapi server into stack object
      gameStack.server = server;

      // Registering Hyperion plugin
      gameStack.server.register({
        register: Hyperion,
        options: gameStack.config.hyperion
      }, function() {
        var log = server.methods.hyperion.log();
        log.info('============ Launching GameStack ============\n'.blue);

        // Displaying errors in console
        server.on('request-error', function(request, err) {
          log.error(err);
        });

        // Register GameStack modules
        log.info('Loaded plugins :'.cyan);
        async.series(_.map(modules, function(options, pluginName) {
          var initTime = Date.now();
          return function(next) {
            gameStack.server.register({
              register: require(pluginName),
              options: options
            }, function(err) {
              if (err) {
                log.error('  %s failed to initialize (%s ms)', pluginName, Date.now() - initTime);
              } else {
                log.info('  %s initialised (%s ms)', pluginName.cyan, Date.now() - initTime);
              }
              next(err);
            });
          };
        }), function(err) {
          if (err) {
            log.error('\nGameStack failed launching : %s', err.message);
            return deferred.reject(err);
          }

          // Starting server
          gameStack.server.start(function() {
            log.info('GameStack launched in %s env in %s ms\n'.green, process.env.NODE_ENV, new Date().getTime() - startTime);
            log.info('Available servers :');

            gameStack.server.connections.forEach(function(connection) {
              log.info('  %s [ %s ]', connection.info.uri, connection.settings.labels.join(' - '));
            });

            // Resolve start promise
            deferred.resolve();
          });
        });
      });
    });

    return deferred.promise;
  }
});
