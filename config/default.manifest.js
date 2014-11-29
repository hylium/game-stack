'use strict';

module.exports = {
  pack: {
    debug: {
      request: ['uncaught']
    }
  },
  servers: [{
    host: 'localhost',
    port: process.env.PORT || 6001,
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
    port: process.env.PORT || 6002,
    description: 'Website server',
    options: {
      labels: ['website'],
      payload: {
        maxBytes: 100 * 1024
      }
    }
  }, {
    host: 'localhost',
    port: process.env.PORT || 6003,
    description: 'Game app server',
    options: {
      labels: ['game'],
      payload: {
        maxBytes: 100 * 1024
      }
    }
  }, {
    host: 'localhost',
    port: process.env.PORT || 6004,
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
      opsInterval: 1000,
      reporters: [{
        reporter: require('good-console'),
        args:[{ log: '*', request: '*' }]
      }],
      logRequestPayload: true
    },
    lout: {
      endpoint: '/_docs'
    }
  }
};
