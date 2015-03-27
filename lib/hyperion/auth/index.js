'use strict';

var Q = require('q'), _ = require('lodash');

module.exports = function(server, options, next) {
  if (!options.strategies) {return;}

  Q.all(_.map(options.strategies, function(strategyOptions, strategyName) {
    return Q.Promise(function(resolve, reject) {
      require('./' + strategyName)(server, strategyOptions, function(err) {
        if (err) {
          reject(err);
        } else {
          resolve();
        }
      });
    });
  })).then(function() {
    next();
  }, function(err) {
    next(err);
  });
};
