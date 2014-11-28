define([
    'background/view/youTubePlayerRegion',
    'background/view/clipboardRegion',
    'text!template/backgroundArea.html'
], function (YouTubePlayerRegion, ClipboardRegion, BackgroundAreaTemplate) {
    'use strict';

    var BackgroundAreaView = Marionette.LayoutView.extend({
        id: 'backgroundArea',
        template: _.template(BackgroundAreaTemplate),
        
        regions: function (options) {
            return {
                youTubePlayerRegion: {
                    el: '#' + this.id + '-youTubePlayerRegion',
                    regionClass: YouTubePlayerRegion,
                    youTubePlayer: options.model.get('youTubePlayer')
                },
                clipboardRegion: {
                    el: '#' + this.id + '-clipboardRegion',
                    regionClass: ClipboardRegion
                }              
            };
        },

        onShow: function () {
            Streamus.channels.backgroundArea.vent.trigger('shown');
        }
    });

    return BackgroundAreaView;
});