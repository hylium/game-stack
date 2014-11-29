'use strict';

var assert = require('assert'), GameStack = require('./../index');

describe('GameStack', function() {
  describe('#constrcutor', function() {
    it('should run smoothly whit bare construct', function() {
      (new GameStack(undefined, {startAfterInit: false})).start().then(function() {
        assert(true);
      }, function(err) {
        assert(false, err);
      });
    });
  });
});
