//define(['../common/requireConfig'], function(requireConfig) {
//    'use strict';
//    //  Mix extra properties into requireConfig as necessary.
//    requireConfig.paths.chai = 'thirdParty/test/chai';
//    requireConfig.paths.mocha = 'thirdParty/test/mocha';
//    requireConfig.paths.sinon = 'thirdParty/test/sinon';

//    requireConfig.shim = requireConfig.shim || {};
//    requireConfig.shim.mocha = {
//        exports: 'window.mocha'
//    };

//    requireConfig.shim.sinon = {
//        exports: 'window.sinon'
//    };

//    require.config(requireConfig);

//    //  Then, load all of the plugins needed:
//    require(['test/plugins']);
//});

define(['../common/requireConfig'], function() {
    'use strict';

    //  It didn't make sense to put testing information into requireConfig.
    //  So, I mix it into the config object here.
    requirejs.s.contexts._.config.paths.chai = 'thirdParty/test/chai';
    requirejs.s.contexts._.config.paths.mocha = 'thirdParty/test/mocha';
    requirejs.s.contexts._.config.paths.sinon = 'thirdParty/test/sinon';

    requirejs.s.contexts._.config.shim.mocha = {
        exports: 'window.mocha'
    };

    requirejs.s.contexts._.config.shim.sinon = {
        exports: 'window.sinon'
    };

    //  Then, load all of the plugins needed by test:
    require(['test/plugins']);
});