'use strict';

var Hyperion = require('./hyperion/hyperion'), _ = require('lodash'), GSObject = require('game-stack-object'),
  Q = require('q'), glue = require('glue');

/**
 * GameStack main object.
 * @type {Function}
 */
var GameStack = GSObject.extend({
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
  },

  /**
   * Build up the server with stored configuration
   * @return {GameStack}
   */
  build: function() {
    var gameStack = this;

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
      // Building loaded plugin list
      gameStack.config.hyperion.gameStackPlugins = _.map(_.keys(gameStack.manifest.gameStack.plugins), function(plugin) {
        return {
          name: require(plugin).register.attributes.name,
          module: plugin
        };
      });

      // Register Hyperion
      var configHyperion = _.defaults(gameStack.config.hyperion, gameStack.manifest.gameStack.hyperion);
      return gameStack.registerPlugin(Hyperion, configHyperion).then(function() {
        gameStack.log('info', '============ Initializing GameStack ============\n'.blue);
        gameStack.log('info', 'Loaded plugins :'.cyan);
      });
    });

    // Registering game-stack plugins
    var plugins = gameStack.manifest.gameStack.plugins, i = 0;
    promise = _.reduce(plugins, function(promise, pluginOptions, pluginName) {
      var isLast = i++ === _.keys(plugins).length, plugin = require(pluginName);

      // Extending manifest config with environnement specific configuration
      var pluginConfig = _.merge(gameStack.config[plugin.register.attributes.name] || {}, pluginOptions);

      // Return promise of plugin registration for chaining
      return promise.then(function() {
        return gameStack.registerPlugin(plugin, pluginConfig).then(function() {
          gameStack.log('info', '  %s initialised %s', pluginName.cyan, isLast ? '\n' : '');
        }, function(err) {
          gameStack.log('error', ' %s failed to initialize\n', pluginName.yellow);
          throw err;
        });
      });
    }, promise).then(function() {
      gameStack.log('info', 'GameStack initialized with no errors\n'.green);
      gameStack.$emit('ready');
    });

    // Catching errors
    promise.catch(function(err) {
      gameStack.log('error', 'GameStack failed to initialize with error :');
      gameStack.log('error', err);
    });

    // Automatic start
    if (this.config.stack.startAfterInit) {
      this.$on('ready', function() {
        gameStack.start();
      });
    }

    return this;
  },

  /**
   * Starts the stack
   * @returns {promise|*|Q.promise}
   */
  start: function() {
    var gameStack = this;
    gameStack.log('info', '============ Launching GameStack ============\n'.blue);

    // Displaying errors in console
    gameStack.server.on('request-error', function(request, err) {
      gameStack.log('error', err);
    });

    // Starting server
    return Q.Promise(function(resolve) {
      gameStack.server.start(function() {
        gameStack.log('info', 'GameStack launched in %s environment\n'.green, process.env.NODE_ENV);

        // Saving start time
        gameStack.server.methods.hyperion.data().startTime = new Date();

        // Displaying available servers
        gameStack.log('info', 'Available servers :'.yellow);
        gameStack.server.connections.forEach(function(connection, i) {
          var isLast = i === gameStack.server.connections.length - 1;
          gameStack.log('info', '  %s [ %s ]%s', connection.info.uri, connection.settings.labels.join(' - '), isLast ? '\n' : '');
        });

        resolve();
      });
    }).then(function() {
      // Launching plugins
      return Q.all(_.map(gameStack.manifest.gameStack.plugins, function(pluginOptions, moduleName) {
        var pluginName = require(moduleName).register.attributes.name;
        if (gameStack.server.methods[pluginName] && gameStack.server.methods[pluginName].start) {
          return gameStack.server.methods[pluginName].start();
        } else {
          return null;
        }
      }));
    }).then(function() {
      gameStack.$emit('started');
    }).catch(function(err) {
      gameStack.$emit('error', err);
    });
  },

  /**
   * Register Hapi plugin to the server.
   * @param {Object} plugin
   * @param {Object} options
   * @return {*}
   */
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

  /**
   * Log something using hyperion logger
   */
  log: function() {
    if (!this.server || !this.server.methods.hyperion || !this.server.methods.hyperion.log) {
      throw new Error('Logger is not available at this time. Are you sure that you initialised GameStack correctly ?');
    }
    this.server.methods.hyperion.log.apply(this.server, arguments);
  }
});

module.exports = GameStack;
