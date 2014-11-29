'use strict';

var Hyperion = require('game-stack-hyperion'), path = require('path'), _ = require('lodash'),
  util = require('util'), Hapi = require('hapi'), Q = require('q'), async = require('async');

/**
 * Exit application after displaying an error message
 */
function die() {
  console.error(util.format('\n%s\n', util.format.apply(null, arguments)));
  process.exit(1);
}

/**
 * Instantiate a new GameStack
 * @constructor
 */
function GameStack(manifest, config) {
  // Config loading
  this.config = _.merge(require('./config/default'), config);

  // Building core
  this.core = new Hyperion(this.config.hyperion);

  // Manifest
  var defaultManifest;
  try {
    defaultManifest = require('./config/default.manifest');
  } catch (err) {
    die('Invalid manifest : "%s"', err.message);
  }
  this.manifest = manifest || defaultManifest;

  // Automatic start
  if (this.config.stack.startAfterInit) {
    this.start();
  }
}

/**
 * Starts the stack
 * @returns {promise|*|Q.promise}
 */
GameStack.prototype.start = function() {
  var startTime = Date.now(), gameStack = this;
  this.core.logger.info('Launching GameStack servers');

  // Composing servers pack
  var deferred = Q.defer();
  Hapi.Pack.compose(gameStack.manifest, function(err, pack) {
    if (err) {
      gameStack.core.logger.error('Failed Composing manifest with error : "%s"', err);
      return deferred.reject(err);
    }

    gameStack.pack = pack;

    // Register GameStack plugins
    async.series(gameStack.config.stack.plugins.map(function(plugin) {
      return function(next) {
        gameStack.pack.register(gameStack.core.plugins.create(require(plugin)), next);
      };
    }), function(err) {
      if (err) {
        gameStack.core.logger.error('GameStack failed launching : %s', err.message);
        return deferred.reject(err);
      }

      // Starting pack
      gameStack.pack.start(function() {
        gameStack.core.logger.info('GameStack launched in %s env in %s ms'.green, process.env.NODE_ENV, new Date().getTime() - startTime);
        gameStack.core.logger.info('Available servers :');

        gameStack.pack.servers.forEach(function(s) {
          gameStack.core.logger.info('  %s [ %s ]', s.info.uri, s.settings.labels.join(' - '));
        });

        // Resolve start promise
        deferred.resolve();
      });
    });
  });

  return deferred.promise;
};

module.exports = GameStack;
