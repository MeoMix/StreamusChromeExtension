define(function () {
    'use strict';

    var YouTubePlayerView = Marionette.ItemView.extend({
        tagName: 'iframe',
        id: 'youtube-player',
        template: false,
        //  webRequestCompleted indicates whether loading the src of the iframe was successful
        webRequestCompleted: false,
        //  loaded is set to true when the iframes contentWindow is ready
        loaded: false,

        attributes: function () {
            return {
                name: 'youtube-player',
                frameborder: 0,
                allowfullscreen: 1,
                title: 'YouTube player',
                width: 640,
                height: 360,
                src: 'https://www.youtube.com/embed/?enablejsapi=1&origin=chrome-extension:\\\\' + chrome.runtime.id
            };
        },
        
        events: {
            'load': '_onLoad'
        },
        
        debugManager: null,

        initialize: function (options) {
            this.debugManager = options.debugManager;
            this.model.set('iframeId', this.el.id);

            //  IMPORTANT: I need to bind like this and not just use .bind(this) inline because bind returns a new, anonymous function
            //  which will break chrome's .removeListener method which expects a named function in order to work properly.
            this._onChromeWebRequestBeforeSendHeaders = this._onChromeWebRequestBeforeSendHeaders.bind(this);
            this._onChromeWebRequestSendHeaders = this._onChromeWebRequestSendHeaders.bind(this);
            this._onChromeWebRequestCompleted = this._onChromeWebRequestCompleted.bind(this);

            chrome.webRequest.onBeforeSendHeaders.addListener(this._onChromeWebRequestBeforeSendHeaders, {
                urls: [this.model.get('youTubeEmbedUrl')]
            }, ['blocking', 'requestHeaders']);
            
            //  Ensure that a Referrer was actually attached and sent. Other extensions could prevent this from happening.
            chrome.webRequest.onSendHeaders.addListener(this._onChromeWebRequestSendHeaders, {
                urls: [this.model.get('youTubeEmbedUrl')]
            }, ['requestHeaders']);
            
            chrome.webRequest.onCompleted.addListener(this._onChromeWebRequestCompleted, {
                urls: [this.model.get('youTubeEmbedUrl')],
                types: ['sub_frame']
            });
        },
        
        onBeforeDestroy: function () {
            chrome.webRequest.onBeforeSendHeaders.removeListener(this._onChromeWebRequestBeforeSendHeaders);
            chrome.webRequest.onSendHeaders.removeListener(this._onChromeWebRequestSendHeaders);
            chrome.webRequest.onCompleted.removeListener(this._onChromeWebRequestCompleted);
        },
        
        //  Add a Referer to requests because Chrome extensions don't implicitly have one.
        //  Without a Referer - YouTube will reject most requests to play music.
        _onChromeWebRequestBeforeSendHeaders: function (info) {
            var refererRequestHeader = this._getRefererHeader(info.requestHeaders);
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
        
        //  Log what referers are actually getting sent to help with debugging errors.
        _onChromeWebRequestSendHeaders: function (info) {
            var refererRequestHeader = this._getRefererHeader(info.requestHeaders);
            var referer = _.isUndefined(refererRequestHeader) ? 'none' : refererRequestHeader.value;

            this.debugManager.get('youTubeIFrameReferers').push(referer);
        },
        
        //  Only load YouTube's API once the iframe has been built successfully.
        //  If Internet is lagging or disconnected then _onWebRequestCompleted will not fire.
        //  Even if the Internet is working properly, it's possible to try and load the API before CORS is ready to allow postMessages.
        _onChromeWebRequestCompleted: function () {
            chrome.webRequest.onCompleted.removeListener(this._onWebRequestCompleted);
            this.webRequestCompleted = true;
            this._checkLoadModel();
        },
        
        _checkLoadModel: function () {
            if (this.loaded && this.webRequestCompleted) {
                this.model.load();
            }
        },

        _onLoad: function () {
            this.loaded = true;
            this._checkLoadModel();
        },
        
        _getRefererHeader: function(requestHeaders) {
            var refererRequestHeader = _.find(requestHeaders, function (requestHeader) {
                return requestHeader.name === 'Referer';
            });

            return refererRequestHeader;
        }
    });

    return YouTubePlayerView;
});