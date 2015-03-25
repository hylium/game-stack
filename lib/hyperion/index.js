'use strict';

var GSObject = require('game-stack-object'), Logger = require('./logger');

exports.register = function(server, options, next) {
  var logger = new Logger(options.log);

  server.method({
    name: 'hyperion.log',
    method: function() {
      return logger;
    },
    options: {}
  });

  next();
};

exports.register.attributes = {
  name: 'hyperion'
};
