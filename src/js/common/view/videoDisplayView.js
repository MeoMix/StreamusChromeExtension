//  TODO: Decouple streamItems from this so it can be more easily used in fullscreen.
define([
    'foreground/view/genericForegroundView',
    'foreground/collection/streamItems',
    'foreground/model/player',
    'enum/playerState',
    'foreground/collection/contextMenuGroups',
    'text!template/videoDisplay.html',
    'foreground/view/rightPane/videoDisplayButtonView',
    'common/view/videoView'
], function (GenericForegroundView, StreamItems, Player, PlayerState, ContextMenuGroups, VideoDisplayTemplate, VideoDisplayButtonView, VideoView) {
    'use strict';

    var VideoDisplayView = GenericForegroundView.extend({

        attributes: {
            'id': 'videoDisplay'
        },

        template: _.template(VideoDisplayTemplate),

        panel: null,

        videoDisplayButtonView: new VideoDisplayButtonView(),
        videoView: new VideoView(),

        render: function () {

            this.$el.html(this.template(
                _.extend({
                    //  Mix in chrome to reference internationalize.
                    'chrome.i18n': chrome.i18n
                })
            ));

            this.panel = this.$el.find('.panel');
            
            this.panel.append(this.videoView.render().el);

            return this;
        },

        initialize: function () {

        },

        show: function () {

            //  Store original values in data attribute to be able to revert without magic numbers.
            this.$el.data('background', this.$el.css('background')).transition({
                'background': 'rgba(0, 0, 0, 0.5)'
            }, 'snap');

            this.panel.transition({
                x: this.$el.width()
            }, 'snap');

        }
    });

    return VideoDisplayView;
});