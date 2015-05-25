define(['../common/requireConfig'], function() {
    'use strict';

    // It didn't make sense to put testing information into requireConfig.
    // So, I mix it into the config object here.
    requirejs.s.contexts._.config.paths.chai = 'thirdParty/test/chai';
    requirejs.s.contexts._.config.paths.mocha = 'thirdParty/test/mocha';
    requirejs.s.contexts._.config.paths.sinon = 'thirdParty/test/sinon';

    requirejs.s.contexts._.config.shim.mocha = {
        exports: 'window.mocha'
    };

    requirejs.s.contexts._.config.shim.sinon = {
        exports: 'window.sinon'
    };

    // Then, load all of the plugins needed by test:
    require(['test/plugins']);
});