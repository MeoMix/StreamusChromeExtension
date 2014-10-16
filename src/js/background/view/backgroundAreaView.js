define([
    'background/view/youTubePlayerRegion',
    'background/view/clipboardRegion',
    'text!template/backgroundArea.html'
], function (YouTubePlayerRegion, ClipboardRegion, BackgroundAreaTemplate) {
    'use strict';

    var BackgroundAreaView = Backbone.Marionette.LayoutView.extend({
        id: 'backgroundArea',
        template: _.template(BackgroundAreaTemplate),
        
        regions: function (options) {
            return {
                youTubePlayerRegion: {
                    regionClass: YouTubePlayerRegion,
                    youTubePlayer: options.model.get('youTubePlayer')
                },
                clipboardRegion: ClipboardRegion              
            };
        },

        onShow: function () {
            Streamus.channels.backgroundArea.vent.trigger('shown');
        }
    });

    return BackgroundAreaView;
});