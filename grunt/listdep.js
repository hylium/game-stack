'use strict';

var Path = require('path'), _ = require('lodash'), fs = require('fs'), exec = require('child_process').execSync;

module.exports = function(pathToPackageJSON) {
  return function() {
    var deps = require(Path.join(pathToPackageJSON, 'package.json')).dependencies;

    console.log('\nGameStack dependencies :'.green);

    _.each(deps, function(depTarget, depName) {
      if (depName.indexOf('game-stack') !== 0) {return;}

      var depPath = require.resolve(depName), isGit = false, changed = false;
      try {
        var stat = fs.statSync(Path.join(pathToPackageJSON, 'node_modules/' + depName + '/.git'));
        isGit = stat.isDirectory();
        changed = exec('git status --short', {cwd: Path.join(pathToPackageJSON, 'node_modules/' + depName)}).toString().length !== 0;
      } catch(e){}

      console.log('  - [', (isGit ? 'git'.cyan : 'npm'.blue), ']', depName + (changed ? '*'.yellow : ''), ':', depTarget);
    });
  }
}
