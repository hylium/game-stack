'use strict';

var GSObject = require('game-stack-object'), Logger = require('./logger'), registerAuth = require('./auth');

exports.register = function(server, options, next) {
  var logger = new Logger(options.log);

  server.method([{
    name: 'hyperion.log',
    method: function() {
      logger[arguments[0]].apply(logger, Array.prototype.slice.call(arguments, 1));
    },
    options: {}
  }, {
    name: 'hyperion.getPlugins',
    method: function() {
      return options.gameStackPlugins;
    },
    options: {}
  }]);

  registerAuth(server, next);
};

exports.register.attributes = {
  name: 'hyperion'
};
