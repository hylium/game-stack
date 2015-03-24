'use strict';

var async = require('async'), path = require('path'), _ = require('lodash'), GSObject = require('game-stack-object');

/**
 * Add given routes to the selected server.
 * @param {String} name
 * @param {Object} server
 * @param {Array} routes
 */
function addRoutes(name, server, routes) {
  routes = _.flatten(routes);

  _.each(routes, function(route) {
    // add plugin name as tag
    if (!route.config) {
      route.config = {};
    }

    if (!route.config.tags) {
      route.config.tags = [];
    }

    if (!((process.env.NODE_ENV || 'development') === 'production' && _.contains(route.config.tags, 'test-only'))) {
      if (!_.contains(route.config.tags, name)) {
        route.config.tags.push(name);
      }

      server.route(route);
      log.debug('%s %s loaded', route.method, route.path);
    }
  });
}

/**
 * Loads the plugin routes.
 * @param {Object} server
 * @param {Object} plugin
 * @param {Function} next
 * @returns {*}
 */
function loadRoutes(server, plugin, next) {
  var routes = plugin.routes || [];

  if (_.isFunction(routes)) {
    routes = routes(server);
  }

  if (_.isArray(routes)) {
    addRoutes(server, routes);
  } else {
    Object.keys(routes).forEach(function(key) {
      if (key === '*') {
        addRoutes(server.name, server, routes[key]);
      } else {
        var labels = key.split(',');
        labels.forEach(function(label) {
          addRoutes(server.name, server.select(label), routes[key]);
        });
      }
    });
  }

  next();
}

/**
 * Plugin manager for Hyperion.
 * @type {Function}
 */
var PluginManager = GSObject.extend({
  /**
   * Manages plugins.
   * @constructor
   */
  init: function(core) {
    this.plugins = {};
    this.core = core;
  },

  /**
   * Creates a new GameStack plugin
   * @param {Function} Plugin
   * @returns {{register: Function}}
   */
  create: function(Plugin) {
    var spawn = new Plugin();
    spawn.$$core = this.core;

    var manager = this, plugin = {
      register: function(server, options, next) {
        var startTime = Date.now();

        manager.initPlugin(server, spawn, options, function(err) {
          if (err) {
            manager.core.logger.error('An error has occurred when initializing the plugin "%s" : %s', plugin.name, err.toString());
          } else {
            manager.core.logger.info('  %s initialised (%s ms)', spawn.attributes.name.cyan, Date.now() - startTime);
          }
        });

        return next();
      }
    };

    plugin.register.attributes = Plugin.prototype.attributes || {};
    return plugin;
  },

  /**
   * Initialize plugin.
   * @param {Object} server
   * @param {Object} plugin
   * @param {Object} options
   * @param {Function} callback
   */
  initPlugin: function(server, plugin, options, callback) {
    var manager = this;

    plugin.register(server, options, function(err) {
      if (err) {
        manager.core.logger.error(err.message);
      }

      async.series([loadRoutes].map(function(func) {
        return func.bind(null, server, plugin);
      }), callback);
    });
  }
  ,

  /**
   * Returns an exported plugin.
   * @param key
   * @returns {*}
   */
  get: function(key) {
    return this.plugins[key];
  }
  ,

  /**
   * Expose a plugin so it can me available accoss the whole application.
   * @param {String} key
   * @param {Object} exposed
   * @returns {*}
   */
  expose: function(key, exposed) {
    return this.plugins[key] = exposed;
  }
});

module.exports = PluginManager;
