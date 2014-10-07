define([
    'background/model/clientErrorManager',
    'background/model/youTubePlayer'
], function (ClientErrorManager, YouTubePlayer) {
    'use strict';

    var YouTubePlayerView = Backbone.Marionette.ItemView.extend({
        tagName: 'iframe',
        id: 'youtube-player',
        template: false,
        model: YouTubePlayer,

        attributes: {
            name: 'youtube-player',
            frameborder: 0,
            allowfullscreen: 1,
            title: 'YouTube player',
            width: 640,
            height: 360,
            src: 'https://www.youtube.com/embed/?enablejsapi=1&origin=chrome-extension:\\\\jbnkffmindojffecdhbbmekbmkkfpmjd'
        },

        initialize: function () {
            this.model.set('iframeId', this.el.id);

            //  IMPORTANT: I need to bind like this and not just use .bind(this) inline because bind returns a new, anonymous function
            //  which will break chrome's .removeListener method which expects a named function in order to work properly.
            this._onWebRequestBeforeSendHeaders = this._onWebRequestBeforeSendHeaders.bind(this);
            this._onWebRequestErrorOccurred = this._onWebRequestErrorOccurred.bind(this);

            //chrome.webRequest.onBeforeSendHeaders.addListener(this._onWebRequestBeforeSendHeaders, {
            //    urls: [this.model.get('youTubeEmbedUrl')]
            //}, ['blocking', 'requestHeaders']);

            chrome.webRequest.onErrorOccurred.addListener(this._onWebRequestErrorOccurred, {
                urls: [this.model.get('youTubeEmbedUrl')]
            });
        },
        
        onShow: function () {
            //  Load the YouTube player widget once the view has been shown because then the origin for the iframe has for sure been set / is part of the DOM.
            this.model.load();
        },
        
        onBeforeDestroy: function () {
            chrome.webRequest.onBeforeSendHeaders.removeListener(this._onWebRequestBeforeSendHeaders);
            chrome.webRequest.onErrorOccurred.removeListener(this._onWebRequestErrorOccurred);
        },

        //  Force the HTML5 player without having to get the user to opt-in to the YouTube trial.
        //  Benefits include faster loading, less CPU usage, and no crashing
        //  Also, add a Referer to the request because Chrome extensions don't have one (where a website would). 
        //  Without a Referer - YouTube will reject most of the requests to play music.
        _onWebRequestBeforeSendHeaders: function (info) {
            //  Bypass YouTube's embedded player content restrictions by provided a value for Referer.
            var refererRequestHeader = _.find(info.requestHeaders, function (requestHeader) {
                return requestHeader.name === 'Referer';
            });

            var referer = info.url.substring(0, info.url.indexOf('/embed/'));

            if (_.isUndefined(refererRequestHeader)) {
                info.requestHeaders.push({
                    name: 'Referer',
                    value: referer
                });
            } else {
                refererRequestHeader.value = referer;
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

            return { requestHeaders: info.requestHeaders };
        },
        
        _onWebRequestErrorOccurred: function(details) {
            ClientErrorManager.logErrorMessage(JSON.stringify(details));
            return details;
        }
    });

    return YouTubePlayerView;
});