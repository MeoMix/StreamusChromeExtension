//  TODO: Decouple streamItems from this so it can be more easily used in fullscreen.
define([
    'foreground/view/genericForegroundView',
    'foreground/collection/streamItems',
    'foreground/model/player',
    'enum/playerState',
    'foreground/collection/contextMenuGroups',
    'text!template/videoDisplay.html',
    'common/view/videoView',
    'foreground/model/buttons/videoDisplayButton'
], function (GenericForegroundView, StreamItems, Player, PlayerState, ContextMenuGroups, VideoDisplayTemplate, VideoView, VideoDisplayButton) {
    'use strict';

    var VideoDisplayView = GenericForegroundView.extend({

        attributes: {
            'id': 'videoDisplay'
        },

        template: _.template(VideoDisplayTemplate),

        panel: null,
        
        videoView: null,
        
        events: {
            'click .remove': 'toggleVideoDisplay',
        },

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

            this.videoView = new VideoView();

            this.listenTo(VideoDisplayButton, 'change:enabled', function (model, enabled) {
                if (!enabled) {
                    this.hide();
                }
            });
        },
        
        toggleVideoDisplay: function () {
            VideoDisplayButton.toggleEnabled();
            console.log("VideoDisplayButton is now:", VideoDisplayButton.get('enabled'));
        },

        show: function (instant) {

            //  Store original values in data attribute to be able to revert without magic numbers.
            this.$el.data('background', this.$el.css('background')).transition({
                'background': 'rgba(0, 0, 0, 0.5)'
            }, instant ? 0 : undefined, 'snap');

            this.panel.transition({
                x: this.$el.width()
            }, instant ? 0 : undefined, 'snap');

            console.log("VideoDisplayView is showing");

        },

        hide: function () {

            this.$el.transition({
                'background': this.$el.data('background')
            }, function () {
                //  TODO: Do I need to remove videoView here as well?
                this.remove();
                this.videoView.stopDrawing();
                this.videoView.remove();
            }.bind(this));

            this.panel.transition({
                x: -20
            });
           
        }
    });

    return VideoDisplayView;
});