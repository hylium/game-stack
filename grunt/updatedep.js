'use strict';

var Path = require('path'), _ = require('lodash'), fs = require('fs'), exec = require('child_process').execSync;

module.exports = function(pathToPackageJSON) {
  /**
   * Update a git or npm GameStack dependency
   * @param {String} depName
   */
  function updatedep(depName) {
    var isGit = false;

    try {
      var stat = fs.statSync(Path.join(pathToPackageJSON, 'node_modules/' + depName + '/.git'));
      isGit = stat.isDirectory();
    } catch (e) {}

    console.log('\nUpdating ' + depName + '...');


    if (!isGit) {
      exec('npm update ' + depName, {cwd: Path.join(pathToPackageJSON)});
      return;
    }

    var options = {cwd: Path.join(pathToPackageJSON, 'node_modules/' + depName)};
    exec('git stash', options);
    var history = exec('git status', options);
    var branch = history.toString().match(/(On branch )([\w]+)/)[0].replace('On branch ', '');
    exec('git checkout master', options);
    exec('git pull origin master', options);
    exec('git checkout ' + branch, options);
    try {
      exec('git stash apply', options);
    } catch (e) {}
    exec('npm install', options);
  }

  return function(depName) {
    if (!depName) {
      var deps = require(Path.join(pathToPackageJSON, 'package.json')).dependencies;
      _.each(deps, function(depTarget, depName) {
        if (depName.indexOf('game-stack') !== 0) {return;}
        updatedep(depName);
      });
    } else {
      updatedep(depName);
    }
  };
};
