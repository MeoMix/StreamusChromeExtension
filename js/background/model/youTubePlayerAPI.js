//  Provides an interface to the YouTube iFrame.
//  Starts up Player object after receiving a ready response from the YouTube API.
define(function() {
    'use strict';

    var YouTubePlayerAPI = Backbone.Model.extend({
        defaults: {
            ready: false
        },

        initialize: function() {
            var self = this;

            //  This function will be called when the API is fully loaded. Needs to be exposed globally so YouTube can call it.
            window.onYouTubePlayerAPIReady = function() {
                self.set('ready', true);
            };

            //  
            if (!window['YT']) {
                window.YT = { loading: 0, loaded: 0 };
            }

            if (!window['YTConfig']) {
                window.YTConfig = {};
            }

            if (!YT.loading) {
                window.YT.loading = 1;

                (function() {
                    var l = [];
                    YT.ready = function(f) {
                        if (YT.loaded) {
                            f();
                        } else {
                            l.push(f);
                        }
                    };
                    window.onYTReady = function() {
                        YT.loaded = 1;
                        for (var i = 0; i < l.length; i++) {
                            try {
                                l[i]();
                            } catch(e) {
                            }
                        }
                    };
                    YT.setConfig = function(c) {
                        for (var k in c) {
                            if (c.hasOwnProperty(k)) {
                                YTConfig[k] = c[k];
                            }
                        }
                    };
                })();
            }

            //  I get an error: Unable to post message to https://www.youtube.com. Recipient has origin chrome-extension://pfphaniogbicpiiennilpbbkfmciobch.
            //  unless I wrap this in a document.ready.
            //  This code will trigger onYouTubePlayerAPIReady
            $('<script>', {
                src: 'https://s.ytimg.com/yts/jsbin/www-widgetapi-vfl9DH7J-.js',
                async: true
            }).insertBefore($('script:first'));
        }
    });

    return new YouTubePlayerAPI;
});