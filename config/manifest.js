'use strict';

module.exports = {
  pack: {
    debug: {
      request: ['uncaught']
    }
  },
  servers: [{
    host: 'localhost',
    port: process.env.PORT || 9001,
    description: 'API server',
    options: {
      labels: ['api'],
      payload: {
        maxBytes: 5 * 1024 * 1024
      },
      cors: {
        origin: ['*'],
        additionalMethods: ['PATCH']
      }
    }
  }, {
    host: 'localhost',
    port: process.env.PORT || 9002,
    description: 'Website server',
    options: {
      labels: ['website'],
      payload: {
        maxBytes: 100 * 1024
      }
    }
  }, {
    host: 'localhost',
    port: process.env.PORT || 9003,
    description: 'Game app server',
    options: {
      labels: ['game'],
      payload: {
        maxBytes: 100 * 1024
      }
    }
  }, {
    host: 'localhost',
    port: process.env.PORT || 9004,
    description: 'Auth server',
    options: {
      labels: ['auth'],
      payload: {
        maxBytes: 100 * 1024
      }
    }
  }],
  plugins: {
    good: {
      subscribers: {
        console: [],
        'log/game-stack.log': ['request']
      },
      logRequestPayload: true
    },
    lout: {
      endpoint: '/_docs'
    }
  }
};
