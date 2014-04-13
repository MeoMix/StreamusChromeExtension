//  Provides an interface to the YouTube iFrame.
//  Starts up Player object after receiving a ready response from the YouTube API.
define(function() {
    'use strict';

    var YouTubePlayerAPI = Backbone.Model.extend({
        defaults: {
            ready: false
        },

        initialize: function () {
            console.log("YouTube Player API is initialized");
            // Force the HTML5 player without having to get the user to opt-in to the YouTube trial.
            // Benefits include faster loading, less CPU usage, and no crashing
            // Also, add a Referer to the request because Chrome extensions don't have one (where a website would). 
            // Without a Referer - YouTube will reject most of the requests to play music.
            chrome.webRequest.onBeforeSendHeaders.addListener(function (info) {
                console.log("onBeforeSendHeaders", info);
                //  Bypass YouTube's embedded player content restrictions by provided a value for Referer.
                //var refererRequestHeader = _.find(info.requestHeaders, function (requestHeader) {
                //    return requestHeader.name === 'Referer';
                //});

                //var refererUrl = info.url.substring(0, info.url.indexOf('/embed/'));

                //if (refererRequestHeader === undefined) {
                //    info.requestHeaders.push({
                //        name: 'Referer',
                //        value: refererUrl
                //    });
                //} else {
                //    refererRequestHeader.value = refererUrl;
                //}   

                //  Make Streamus look like an iPhone to guarantee the html5 player shows up even if YouTube has an ad.
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
                console.log('Sending header');
                //  https://www.youtube.com/embed/?enablejsapi=1&amp;origin=chrome-extension%3A%2F%2Fjbnkffmindojffecdhbbmekbmkkfpmjd
                return { requestHeaders: info.requestHeaders };
            }, {
                //urls: ['*://*.youtube.com/embed/?enablejsapi=1&origin=chrome-extension%3A%2F%2Fjbnkffmindojffecdhbbmekbmkkfpmjd']
                //  Match on my specific iframe or else else this logic can leak into outside webpages and corrupt other YouTube embeds.
                urls: ['*://*.youtube.com/embed/?enablejsapi=1&origin=chrome-extension:\\\\jbnkffmindojffecdhbbmekbmkkfpmjd']
            },
                ['blocking', 'requestHeaders']
            );
            
                        chrome.webRequest.onBeforeSendHeaders.addListener(function (info) {
                console.log("onBeforeSendHeaders", info);
                //  Bypass YouTube's embedded player content restrictions by provided a value for Referer.
                var refererRequestHeader = _.find(info.requestHeaders, function (requestHeader) {
                    return requestHeader.name === 'Referer';
                });

                var refererUrl = info.url.substring(0, info.url.indexOf('/embed/'));

                if (refererRequestHeader === undefined) {
                    info.requestHeaders.push({
                        name: 'Referer',
                        value: refererUrl
                    });
                } else {
                    refererRequestHeader.value = refererUrl;
                }   

                //  Make Streamus look like an iPhone to guarantee the html5 player shows up even if YouTube has an ad.
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
                console.log('Sending header');
                //  https://www.youtube.com/embed/?enablejsapi=1&amp;origin=chrome-extension%3A%2F%2Fjbnkffmindojffecdhbbmekbmkkfpmjd
                return { requestHeaders: info.requestHeaders };
            }, {
                //urls: ['*://*.youtube.com/embed/?enablejsapi=1&origin=chrome-extension%3A%2F%2Fjbnkffmindojffecdhbbmekbmkkfpmjd']
                //  Match on my specific iframe or else else this logic can leak into outside webpages and corrupt other YouTube embeds.
                urls: ['*://*.youtube.com/embed/?enablejsapi=1&origin=chrome-extension:\\\\jbnkffmindojffecdhbbmekbmkkfpmjd']
            },
                ['blocking', 'requestHeaders']
            );
            
            //  This function will be called when the API is fully loaded. Needs to be exposed globally so YouTube can call it.
            window.onYouTubePlayerAPIReady = function () {
                console.log("API ready");
                this.set('ready', true);
            }.bind(this);

            console.log("Injecting IFrame API");
            $('<script>', {
                src: 'https://www.youtube.com/iframe_api',
                async: true
            }).insertBefore($('script:first'));

        }
    });

    return YouTubePlayerAPI;
});