'use strict';

process.env.NODE_ENV = process.env.NODE_ENV || 'development';
process.env.NODE_CONFIG_DIR = __dirname + '/config';

var hyperion = require('game-stack-hyperion'),
  path = require('path'),
  _ = require('lodash'),
  util = require('util');

function die() {
  console.error(util.format('\n%s\n', util.format.apply(null, arguments)));
}

process.env.NODE_CONFIG_DIR = path.join(process.env.NODE_CONFIG_DIR, 'environments');
var config = require('config');

if (_.isEmpty(config)) {
  die('Configuration not found in %s', process.env.NODE_CONFIG_DIR);
}

console.log(hyperion.log);

hyperion.log.init(config.log);

(function startGameStack(){
  //var startTime = Date.now();
  hyperion.log.info('Launching GameStack servers');
})();
