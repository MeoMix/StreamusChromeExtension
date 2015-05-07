﻿define(function() {
    'use strict';

    var YouTubePlayerView = Marionette.ItemView.extend({
        tagName: 'iframe',
        id: 'youtube-player',
        template: false,
        //  webRequestCompleted indicates whether loading the src of the iframe was successful
        webRequestCompleted: false,
        //  loaded is set to true when the iframes contentWindow is ready
        loaded: false,

        attributes: function() {
            return {
                name: 'youtube-player',
                frameborder: 0,
                allowfullscreen: 1,
                title: 'YouTube player',
                width: 640,
                height: 360,
                //  Pass streamus=1 to uniquely identify the URL at design time. This allows for manifest.json to target just this URL.
                //  manifest.json cannot receive variables so it's not possible to match on chrome.runtime.id
                src: 'https://www.youtube.com/embed/J1Ol6M0d9sg?streamus=1&enablejsapi=1&origin=chrome-extension://' + chrome.runtime.id
            };
        },

        events: {
            'load': '_onLoad'
        },

        initialize: function() {
            this.model.set('iframeId', this.el.id);

            //  IMPORTANT: I need to bind like this and not just use .bind(this) inline because bind returns a new, anonymous function
            //  which will break chrome's .removeListener method which expects a named function in order to work properly.
            this._onChromeWebRequestBeforeSendHeaders = this._onChromeWebRequestBeforeSendHeaders.bind(this);
            this._onChromeWebRequestCompleted = this._onChromeWebRequestCompleted.bind(this);

            chrome.webRequest.onBeforeSendHeaders.addListener(this._onChromeWebRequestBeforeSendHeaders, {
                urls: [this.el.src]
            }, ['blocking', 'requestHeaders']);

            chrome.webRequest.onCompleted.addListener(this._onChromeWebRequestCompleted, {
                urls: [this.el.src],
                types: ['sub_frame']
            });
        },

        onBeforeDestroy: function() {
            chrome.webRequest.onBeforeSendHeaders.removeListener(this._onChromeWebRequestBeforeSendHeaders);
            chrome.webRequest.onCompleted.removeListener(this._onChromeWebRequestCompleted);
        },
        
        //  Add a Referer to requests because Chrome extensions don't implicitly have one.
        //  Without a Referer - YouTube will reject most requests to play music.
        _onChromeWebRequestBeforeSendHeaders: function(info) {
            var refererRequestHeader = this._getHeader(info.requestHeaders, 'Referer');
            //  TODO: I think it would be prudent to set the referer to this.el.src
            var referer = 'https://www.youtube.com/';

            if (_.isUndefined(refererRequestHeader)) {
                info.requestHeaders.push({
                    name: 'Referer',
                    value: referer
                });
            } else {
                refererRequestHeader.value = referer;
            }

            return { requestHeaders: info.requestHeaders };
        },
        
        //  Only load YouTube's API once the iframe has been built successfully.
        //  If Internet is lagging or disconnected then _onWebRequestCompleted will not fire.
        //  Even if the Internet is working properly, it's possible to try and load the API before CORS is ready to allow postMessages.
        _onChromeWebRequestCompleted: function() {
            chrome.webRequest.onCompleted.removeListener(this._onWebRequestCompleted);
            this.webRequestCompleted = true;
            this._checkLoadModel();
        },

        _checkLoadModel: function() {
            if (this.loaded && this.webRequestCompleted) {
                this.model.load();
            }
        },

        _onLoad: function() {
            this.loaded = true;
            this._checkLoadModel();
        },

        _getHeader: function(requestHeaders, headerName) {
            var refererRequestHeader = _.find(requestHeaders, function(requestHeader) {
                return requestHeader.name === headerName;
            });

            return refererRequestHeader;
        }
    });

    return YouTubePlayerView;
});