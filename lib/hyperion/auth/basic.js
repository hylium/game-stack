'use strict';

var Bcrypt = require('bcrypt');

module.exports = function(server, options, next) {
  server.register(require('hapi-auth-basic'), function (err) {

    server.auth.strategy('simple', 'basic', {
      validateFunc: function(username, password, callback) {
        // Retrieve user
        server.methods[options.dataStorePlugin].getUser(username).then(function(user) {
          if (!user) {
            callback(null, false);
          }

          Bcrypt.compare(password, user.password, function(err, isValid) {
            callback(err, isValid, {id: user.id, name: user.name});
          });
        }, function(err) {
          callback(err, false);
        });
      }
    });

    next(err);
  });
};
