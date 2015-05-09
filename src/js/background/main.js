//define(['../common/requireConfig'], function(requireConfig) {
//    'use strict';
//    //  Mix extra properties into requireConfig as necessary.
//    requireConfig.paths.cocktail = 'thirdParty/cocktail';

//    requireConfig.shim = requireConfig.shim || {};
//    requireConfig.shim['https://www.google-analytics.com/analytics.js'] = {
//        exports: 'window.ga'
//    };
    
//    //  Setup the configuration needed to use requireJS
//    require.config(requireConfig);

//    //  Then, load all of the plugins needed:
//    require(['background/plugins']);
//});

define(['../common/requireConfig'], function() {
    'use strict';

    //  Opening background.html into its own tab causes the program to work incorrectly for a multitude of reasons.
    //  Prevent this by detecting the background being open outside of its default usage.
    if (document.location.pathname === '/background.html' && window !== chrome.extension.getBackgroundPage()) {
        window.close();
    } else {
        //  Then, load all of the plugins needed by the background:
        require(['background/plugins']);
    }
});