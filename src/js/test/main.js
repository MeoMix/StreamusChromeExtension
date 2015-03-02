define(['../common/requireConfig'], function(requireConfig) {
    'use strict';
    //  Mix extra properties into requireConfig as necessary.
    requireConfig.paths['chai'] = 'thirdParty/test/chai';
    requireConfig.paths['mocha'] = 'thirdParty/test/mocha';
    requireConfig.paths['sinon'] = 'thirdParty/test/sinon';

    requireConfig.shim['mocha'] = {
        exports: 'window.mocha'
    };

    requireConfig.shim['sinon'] = {
        exports: 'window.sinon'
    };

    require.config(requireConfig);

    //  Then, load all of the plugins needed:
    require(['test/plugins']);
});