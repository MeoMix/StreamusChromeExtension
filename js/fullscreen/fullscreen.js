define([
    'videoDisplayView'
], function (VideoDisplayView) {
    'use strict';

    var FullscreenView = Backbone.View.extend({

        events: {
        },

        render: function(){

        },

        initialize: function () {

            //  Make the canvas full-screen size.
            var videoDisplayView = new VideoDisplayView;

            var element = videoDisplayView.render().el;
            element.width = window.innerWidth;
            element.height = window.innerHeight;
            $('body').append(element);
            
            $(window).on('resize', function () {

                element.width = window.innerWidth;
                element.height = window.innerHeight;

                if ((screen.availHeight || screen.height - 30) <= window.innerHeight) {
                    // browser is almost certainly fullscreen
                    videoDisplayView.render();
                    
                } else {
                    
                    //  They decided to click 'exit fullscreen' instead of hit f11.
                    chrome.windows.getAll(function (windows) {

                        var window = _.findWhere(windows, { focused: true });
                        chrome.windows.remove(window.id);

                    });
                    
                }

            });

            $(window).keydown(function (event) {
                
                //  When the user exits fullscreen, kill the window.
                if (event.keyCode === 122) {

                    chrome.windows.getAll(function(windows) {

                        var window = _.findWhere(windows, { state: "fullscreen" });
                        chrome.windows.remove(window.id);

                    });

                }
                
                event.stopPropagation();
                return false;
                
            });
            
            
            
        }

    });

    return new FullscreenView;
});