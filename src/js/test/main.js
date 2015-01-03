require([
    '../common/requireConfig'
], function () {
    'use strict';
    
    requirejs.s.contexts._.config.paths.chai = 'thirdParty/chai';
    requirejs.s.contexts._.config.paths.mocha = 'thirdParty/mocha';
    requirejs.s.contexts._.config.paths.sinon = 'thirdParty/sinon';

    requirejs.s.contexts._.config.shim.mocha = {
        exports: 'window.mocha'
    };

    requirejs.s.contexts._.config.shim.sinon = {
        exports: 'window.sinon'
    };

    //  Then, load all of the plugins needed by test:
    require(['test/plugins']);
});