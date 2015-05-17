//define(['../common/requireConfig'], function(requireConfig) {
//    'use strict';
//    //  Mix extra properties into requireConfig as necessary.
//    requireConfig.paths['jquery.perfectScrollbar'] = 'thirdParty/jquery.perfectScrollbar';
//    requireConfig.paths['jquery-ui'] = 'thirdParty/jquery-ui';

//    //  Setup the configuration needed to use requireJS
//    require.config(requireConfig);

//    //  Then, load all of the plugins needed:
//    require(['foreground/plugins']);
//});

define(['../common/requireConfig'], function() {
    'use strict';

    //  Load all of the plugins needed by the foreground:
    require(['foreground/plugins']);
});