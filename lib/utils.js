'use strict';

var _ = require('lodash');

module.exports = {
  extendPlugin: function extend(base, prop) {
    var extended = _.clone(base);

    _.each(prop, function(property, name) {
      if (_.isFunction(base[name])) {
        extended[name] = function() {
          var tmp = extended._super;
          extended._super = base[name];
          var result = property.apply(extended, arguments);
          extended._super = tmp;
          return result;
        }
      } else {
        extended[name] = property;
      }
    });

    return extended;
  }
};
