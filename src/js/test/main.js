define(['../common/requireConfig'], function() {
  'use strict';

  requirejs.onError = function(err) {
    console.log('err:', err);
    console.log(err.requireType);
    if (err.requireType === 'timeout') {
      console.log('modules: ' + err.requireModules);
    }

    throw err;
  };

  // Then, load all of the plugins needed by test:
  require(['test/plugins']);
});