define(function(require) {
    'use strict';

    var YouTubePlayerRegion = require('background/view/youTubePlayerRegion');
    var ClipboardRegion = require('background/view/clipboardRegion');
    var BackgroundAreaTemplate = require('text!template/backgroundArea.html');

    var BackgroundAreaView = Marionette.LayoutView.extend({
        id: 'backgroundArea',
        el: '#backgroundArea',
        template: _.template(BackgroundAreaTemplate),

        regions: function(options) {
            return {
                youTubePlayerRegion: {
                    el: '[data-region=youTubePlayer]',
                    regionClass: YouTubePlayerRegion,
                    //  TODO: feels weird to need to do this... all other regions aren't functions
                    youTubePlayer: options.model.get('youTubePlayer')
                },
                clipboardRegion: {
                    el: '[data-region=clipboard]',
                    regionClass: ClipboardRegion
                }
            };
        },
        
        initialize: function() {
            this.model.get('analyticsManager').sendPageView('/background.html');
        },

        onRender: function() {
            Streamus.channels.backgroundArea.vent.trigger('rendered');
        }
    });

    return BackgroundAreaView;
});