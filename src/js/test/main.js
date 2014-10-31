require([
    '../common/requireConfig'
], function (requireConfig) {
    'use strict';

    requireConfig.paths.chai = 'thirdParty/chai';
    requireConfig.paths.mocha = 'thirdParty/mocha';
    requireConfig.paths.sinon = 'thirdParty/sinon';

    requireConfig.shim.mocha = {
        exports: 'window.mocha'
    };

    requireConfig.shim.sinon = {
        exports: 'window.sinon'
    };

    require.config(requireConfig);

    //  Then, load all of the plugins needed by test:
    require(['test/plugins']);
});