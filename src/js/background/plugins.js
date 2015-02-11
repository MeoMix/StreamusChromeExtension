define([
    'cocktail',
    'backbone.marionette',
    'backbone.localStorage',
    'googleAnalytics'
], function (Cocktail) {
    'use strict';

    Cocktail.patch(Backbone);
    ga('send', 'pageview', '/background.html');
    
    //  Some sensitive data is not committed to GitHub. Use an example file to help others and provide detection of incomplete setup.
    requirejs.onError = function (error) {
        var headerWritten = false;

        error.requireModules.forEach(function (requireModule) {
            if (requireModule.indexOf('background/key/') !== -1) {
                if (!headerWritten) {
                    console.log('%c ATTENTION! Additional configuration is required', 'color: rgb(66,133,244); font-size: 18px; font-weight: bold;');
                    console.log('%c -----------------------------------------------', 'color: rgb(66,133,244); font-size: 18px; font-weight: bold;');
                    headerWritten = true;
                }

                console.log('%cKey not found. \n Rename "' + requireModule + '.js.example" to "' + requireModule + '.js".\n Then, follow the instructions in the file.', 'color: red');
            }
        });
        
        if (headerWritten) {
            console.log('%c -----------------------------------------------', 'color: rgb(66,133,244); font-size: 18px; font-weight: bold;');
        }
    };

    //  Finally, load the application:
    require(['background/application']);
});