require.config({
    shim: {
        underscore: {
            exports: '_'
        },
        backbone: {
            //  These script dependencies should be loaded before loading backbone.js
            deps: ['underscore', 'jquery'],
            //  Once loaded, use the global 'Backbone' as the module value.
            exports: 'Backbone'
        },
        googleApiClient: {
            exports: 'GoogleApiClient'
        }
    }
});

require([
    'jquery',
    'underscore',
    'backbone',
    'googleApiClient'
], function ($, _, Backbone, GoogleApiClient) {
    'use strict';
    
    //  This URL is super important. Streamus uses it to bypass the YouTube error 'not allowed to play content in embedded player' by making itself look like YouTube!
    var refererUrl = 'https://www.youtube.com/embed/undefined?enablejsapi=1';

    //  This has to be setup SUPER early because I can't load the YouTube iframe without generating ugly errors unless this is in place.
    //  Error looks like: Blocked a frame with origin "https://www.youtube.com" from accessing a frame with origin 
    //  "chrome-extension://jbnkffmindojffecdhbbmekbmkkfpmjd".  The frame requesting access has a protocol of "https",
    //  the frame being accessed has a protocol of "chrome-extension". Protocols must match.

    //  Modify the iFrame headers to force HTML5 player and to look like we're actually a YouTube page.
    //  The HTML5 player seems more reliable (doesn't crash when Flash goes down) and looking like YouTube
    //  means we can bypass a lot of the embed restrictions.
    chrome.webRequest.onBeforeSendHeaders.addListener(function (info) {

        //  Bypass YouTube's embedded player content restrictions by looking like YouTube
        //  Any referer will do, maybe change to Streamus.com in the future? Or maybe leave as YouTube
        //  to stay under the radar. Not sure which is less suspicious.
        
        var refererRequestHeader = _.find(info.requestHeaders, function (requestHeader) {
            return requestHeader.name === 'Referer';
        });

        if (refererRequestHeader === undefined) {
            info.requestHeaders.push({
                name: 'Referer',
                value: refererUrl
            });
        } else {
            refererRequestHeader.value = refererUrl;
        }

        //  Make Streamus look like an iPhone to guarantee the html5 player shows up even if the video has an ad.
        var userAgentRequestHeader = _.find(info.requestHeaders, function (requestHeader) {
            return requestHeader.name === 'User-Agent';
        });

        var iPhoneUserAgent = 'Mozilla/5.0 (iPhone; U; CPU iPhone OS 4_3_2 like Mac OS X; en-us) AppleWebKit/533.17.9 (KHTML, like Gecko) Version/5.0.2 Mobile/8H7 Safari/6533.18.5';
        if (userAgentRequestHeader === undefined) {
            info.requestHeaders.push({
                name: 'User-Agent',
                value: iPhoneUserAgent
            });
        } else {
            userAgentRequestHeader.value = iPhoneUserAgent;
        }

        return { requestHeaders: info.requestHeaders };
    }, {
        urls: [refererUrl]
    },
        ['blocking', 'requestHeaders']
    );

    //  Only use main.js for loading external helper files before the background is ready. Then, load the background.
    require(['background']);
});