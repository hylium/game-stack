'use strict';

var Hyperion = require('game-stack-hyperion'), path = require('path'), _ = require('lodash'),
  util = require('util'), Hapi = require('hapi'), Q = require('q');

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
function GameStack(manifest, options) {
  // Default options
  this.config = _.merge({
    startAfterInit: true
  }, (options || {}));

  // Environment configuration
  process.env.NODE_ENV = process.env.NODE_ENV || 'development';
  process.env.NODE_CONFIG_DIR = __dirname + '/config';
  process.env.NODE_CONFIG_DIR = path.join(process.env.NODE_CONFIG_DIR, 'environments');

  // Config loading
  var config = require('config');
  if (_.isEmpty(config)) {
    die('Configuration not found in %s', process.env.NODE_CONFIG_DIR);
  }

  // Building core
  this.core = new Hyperion(config);

  // Manifest
  var defaultManifest;
  try {
    defaultManifest = require('./config/default.manifest');
  } catch (err) {
    die('Invalid manifest : "%s"', err.message);
  }
  this.manifest = manifest || defaultManifest;

  // Automatic start
  if (this.config.startAfterInit) {
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
      deferred.reject(err);
      return;
    }

    gameStack.pack = pack;

    // Starting pack
    gameStack.pack.start(function() {
      gameStack.core.logger.info('GameStack launched in %s env in %s ms'.green, process.env.NODE_ENV, new Date().getTime() - startTime);
      gameStack.core.logger.info('Available servers :');

      gameStack.pack.servers.forEach(function(s) {
        gameStack.core.logger.info('  %s [ %s ]', s.info.uri, s.settings.labels.join(' - '));
      });

      deferred.resolve();
    });
  });

  return deferred.promise;
};

module.exports = GameStack;
