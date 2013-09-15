//  Provides an interface to the YouTube iFrame.
//  Starts up Player object after receiving a ready response from the YouTube API.
define(function () {
    'use strict';

    var YouTubePlayerAPI = Backbone.Model.extend({
        defaults: {
            ready: false
        },
        
        initialize: function () {
            var self = this;
            
            //  This function will be called when the API is fully loaded. Needs to be exposed globally so YouTube can call it.
            window.onYouTubePlayerAPIReady = function () {
                self.set('ready', true);
            };

            //  I get an error: Unable to post message to https://www.youtube.com. Recipient has origin chrome-extension://pfphaniogbicpiiennilpbbkfmciobch.
            //  unless I wrap this in a document.ready.
            $(function () {
                //  This code will trigger onYouTubePlayerAPIReady
                $('<script>', {
                    src: 'https://s.ytimg.com/yts/jsbin/www-widgetapi-vflwt8QCF.js',
                    async: true
                }).insertBefore($('script:first'));
            });
        }
    });
    
    return new YouTubePlayerAPI;    
});