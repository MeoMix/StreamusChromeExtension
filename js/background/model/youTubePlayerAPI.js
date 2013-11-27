//  Provides an interface to the YouTube iFrame.
//  Starts up Player object after receiving a ready response from the YouTube API.
define(function() {
    'use strict';

    var YouTubePlayerAPI = Backbone.Model.extend({
        defaults: {
            ready: false
        },

        initialize: function() {

            //  Modify the iFrame headers to force HTML5 player and to look like we're actually a YouTube page.
            //  The HTML5 player seems more reliable (doesn't crash when Flash goes down) and looking like YouTube
            //  means we can bypass a lot of the embed restrictions.
            chrome.webRequest.onBeforeSendHeaders.addListener(function (info) {

                //  Bypass YouTube's embedded player content restrictions by provided a value for Referer.
                //  I chose to look like YouTube because that seems the best/safest ooption.
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
                urls: ['*://*.youtube.com/embed/*']
            },
                ['blocking', 'requestHeaders']
            );
            
            //  This function will be called when the API is fully loaded. Needs to be exposed globally so YouTube can call it.
            window.onYouTubePlayerAPIReady = function() {
                this.set('ready', true);
            }.bind(this);
            
            $('<script>', {
                src: 'https://www.youtube.com/iframe_api',
                async: true
            }).insertBefore($('script:first'));
        }
    });

    return new YouTubePlayerAPI();
});