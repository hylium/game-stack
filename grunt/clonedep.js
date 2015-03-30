'use strict';

var Path = require('path'), _ = require('lodash'), fs = require('fs'), exec = require('child_process').execSync;

module.exports = function(pathToPackageJSON) {
  /**
   * Clone a GameStack dependency
   * @param {String} depName
   * @param {String} depTarget
   */
  function clonedep(depName, depTarget) {
    var isGit = false;

    try {
      var stat = fs.statSync(Path.join(pathToPackageJSON, 'node_modules/' + depName + '/.git'));
      isGit = stat.isDirectory();
    } catch(e){}

    if (isGit) {
      console.warn('Package', depName, 'is already cloned');
      return;
    }

    if (depTarget.indexOf('git+') !== 0) {
      console.error('You must provide a git url n the package.json in order to allow cloning');
      return;
    }

    try {
      fs.statSync(Path.join(pathToPackageJSON, 'node_modules/' + depName));
      console.error(depName, 'is already installed probably via npm, please the folder first');
      return;
    } catch(e){}

    console.log('\nCloning', depName + '...');
    exec('git clone ' + depTarget.replace('git+', ''), {cwd: Path.join(pathToPackageJSON, 'node_modules/')});
    exec('npm i', {cwd: Path.join(pathToPackageJSON, 'node_modules/' + depName)});
  }

  return function(depName) {
    var deps = require(Path.join(pathToPackageJSON, 'package.json')).dependencies;

    if (!depName) {
      _.each(deps, function(depTarget, depName) {
        if (depName.indexOf('game-stack') !== 0) {return;}
        clonedep(depName, depTarget);
      });
    } else {
      clonedep(depName, deps[depName]);
    }
  };
};
