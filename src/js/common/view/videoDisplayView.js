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

            var topBarRightGroup = this.panel.find('.top-bar .right-group');
            topBarRightGroup.append(this.videoDisplayButtonView.render().el);

            return this;
        },

        initialize: function () {

            console.log("Listening to model:", this.videoDisplayButtonView.model);

            this.listenTo(this.videoDisplayButtonView.model, 'change:enabled', function (model, enabled) {
                console.log("Enabled changed!");
                if (!enabled) {
                    this.hide();
                }
            });
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

            console.log("Hiding!");

            this.$el.transition({
                'background': this.$el.data('background')
            }, function () {
                //  Make sure the YouTube iframe doesn't keep spamming messages to the foreground by disconnect port.
                this.videoView.disconnectPort();
                this.remove();
            }.bind(this));

            this.panel.transition({
                x: -20
            });
           
        }
    });

    return VideoDisplayView;
});