'use strict';

module.exports = function(grunt) {
  var localConfig;
  try {
    localConfig = require('./core/config/local.env');
  } catch(e) {
    localConfig = {};
  }

  // Load grunt tasks automatically, when needed
  require('jit-grunt')(grunt, {

  });

  // Time how long tasks take. Can help when optimizing build times
  require('time-grunt')(grunt);

  grunt.initConfig({
    gameStack: {
      path: 'core',
      test: 'test'
    },

    jshint: {
      options: {
        jshintrc: './.jshintrc'
      },
      all: [
        '<%= gameStack.path%>/**/*.js'
      ]
    },

    env: {
      test: {
        NODE_ENV: 'test'
      },
      prod: {
        NODE_ENV: 'production'
      },
      all: localConfig
    },

    mocha: {
      test: {
        src: ['test/**/*.spec.js']
      }
    },

    watch: {
      test: {
        files: ['<%= gameStack.test%>/**/*.spec.js'],
        tasks: ['env:test', 'mocha:test']
      },
      gruntfile: {
        files: ['Gruntfile.js']
      }
    },

    // Use nodemon to run server in debug mode with an initial breakpoint
    nodemon: {
      debug: {
        script: 'index.js'
      }
    }
  });
};
