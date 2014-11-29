'use strict';

module.exports = function(grunt) {

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
        jshintrc: './.jshintrc',
        reporter: require('jshint-stylish')
      },
      all: [
        './**/*.js',
        '!./node_modules/**/*'
      ]
    },

    env: {
      dev: {
        NODE_ENV: 'development'
      },
      test: {
        NODE_ENV: 'test'
      },
      prod: {
        NODE_ENV: 'production'
      }
    },

    mochaTest: {
      test: {
        options: {
          reporter: 'dot',
          require: 'should'
        },
        src: ['test/**/*.js']
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

  grunt.registerTask('test', ['env:test', 'mochaTest']);
};
