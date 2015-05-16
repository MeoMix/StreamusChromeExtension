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
                youTubePlayer: {
                    el: '[data-region=youTubePlayer]',
                    regionClass: YouTubePlayerRegion,
                    youTubePlayer: options.model.get('youTubePlayer')
                },
                clipboard: {
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