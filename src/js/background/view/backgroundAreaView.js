define(function (require) {
    'use strict';

    var YouTubePlayerRegion = require('background/view/youTubePlayerRegion');
    var ClipboardRegion = require('background/view/clipboardRegion');
    var BackgroundAreaTemplate = require('text!template/backgroundArea.html');

    var BackgroundAreaView = Marionette.LayoutView.extend({
        id: 'backgroundArea',
        template: _.template(BackgroundAreaTemplate),
        
        regions: function (options) {
            return {
                youTubePlayerRegion: {
                    el: '#' + this.id + '-youTubePlayerRegion',
                    regionClass: YouTubePlayerRegion,
                    youTubePlayer: options.model.get('youTubePlayer'),
                    debugManager: options.model.get('debugManager')
                },
                clipboardRegion: {
                    el: '#' + this.id + '-clipboardRegion',
                    regionClass: ClipboardRegion
                }              
            };
        },

        onAttach: function () {
            Streamus.channels.backgroundArea.vent.trigger('attached');
        }
    });

    return BackgroundAreaView;
});