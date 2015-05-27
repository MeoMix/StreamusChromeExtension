define(['../common/requireConfig'], function() {
  'use strict';

  // It didn't make sense to put testing information into requireConfig.
  // So, I mix it into the config object here.
  requirejs.s.contexts._.config.paths.chai = 'thirdParty/test/chai';
  requirejs.s.contexts._.config.paths.sinon = 'thirdParty/test/sinon';

  requirejs.s.contexts._.config.shim.sinon = {
    exports: 'window.sinon'
  };

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