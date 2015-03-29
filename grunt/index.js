'use strict';

module.exports = function(pathToPackageJSON) {
  return {
    listdep: require('./listdep')(pathToPackageJSON),
    clonedep: require('./clonedep')(pathToPackageJSON),
    updatedep: require('./updatedep')(pathToPackageJSON),
  };
};
