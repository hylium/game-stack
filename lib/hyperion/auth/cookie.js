'use strict';

module.exports = function(server, options, next) {
  server.register(require('hapi-auth-cookie'), function (err) {

    server.auth.strategy('session', 'cookie', options);

    next(err);
  });
};
