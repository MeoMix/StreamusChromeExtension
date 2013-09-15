//  Spinners share a lot of common characteristics. Use this to generate spinners so that common characteristics
//  aren't copy/pasted each time a new spinner is needed.
define([
    'spin'
], function (Spin) {
    'use strict';

    var SpinnerBuilder = Backbone.Model.extend({
        
        defaults: function () {
            return {
                defaultOptions: {
                    lines: 13, // The number of lines to draw
                    length: 6, // The length of each line
                    width: 2, // The line thickness
                    corners: 1, // Corner roundness (0..1)
                    rotate: 0, // The rotation offset
                    direction: 1, // 1: clockwise, -1: counterclockwise
                    color: '#000', // #rgb or #rrggbb
                    speed: 2, // Rounds per second
                    trail: 25, // Afterglow percentage
                    shadow: false, // Whether to render a shadow
                    hwaccel: true, // Whether to use hardware acceleration
                    className: 'spinner', // The CSS class to assign to the spinner
                    zIndex: 2e9 // The z-index (defaults to 2000000000)
                }
            };
        },
        
        //  This is the buffering spinner for the Play/Pause button.
        buildPlayPauseSpinner: function () {

            var options = $.extend({}, this.get('defaultOptions'), {
                radius: 10,
                top: 3
            });

            var playPauseSpinner = new Spin(options);

            return playPauseSpinner;
        },

        //  This is the loading spinner which shows over a Playlist when it is loading information from YouTube.
        buildPlaylistSpinner: function () {

            var options = $.extend({}, this.get('defaultOptions'), {
                radius: 8,
                top: 5
            });

            var playlistSpinner = new Spin(options);

            return playlistSpinner;
        }

    });

    return new SpinnerBuilder;
})