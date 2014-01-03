//  TODO: Decouple streamItems from this so it can be more easily used in fullscreen.
define([
    'foreground/view/genericForegroundView',
    'foreground/collection/streamItems',
    'foreground/model/player',
    'enum/playerState',
    'foreground/collection/contextMenuGroups',
    'text!template/videoDisplay.html',
    'common/view/videoView',
    'foreground/model/buttons/videoDisplayButton',
    //  TODO: Should be moved to a common location:
    'foreground/view/rightPane/playPauseButtonView',
    'foreground/view/rightPane/previousButtonView',
    'foreground/view/rightPane/nextButtonView',
    'foreground/view/rightPane/volumeControlView'
], function (GenericForegroundView, StreamItems, Player, PlayerState, ContextMenuGroups, VideoDisplayTemplate, VideoView, VideoDisplayButton, PlayPauseButtonView, PreviousButtonView, NextButtonView, VolumeControlView) {
    'use strict';

    //  TODO: Maybe I should implement a naming standard like VideoAreaView for groupings around explicit views.
    var VideoDisplayView = GenericForegroundView.extend({

        attributes: {
            'id': 'videoDisplay'
        },

        template: _.template(VideoDisplayTemplate),

        panel: null,
        
        videoView: null,
        playPauseButtonView: null,
        previousButtonView: null,
        nextButtonView: null,
        volumeControlView: null,
        
        events: {
            'click .remove': 'toggleVideoDisplay',
        },

        render: function () {
            
            this.$el.html(this.template({
                //  Mix in chrome to reference internationalize.
                'chrome.i18n': chrome.i18n,
                'title': StreamItems.getSelectedItem().get('title')
            }));

            this.panel = this.$el.find('.panel');
            this.panel.append(this.videoView.render().el);

            this.$el.find('#volumeControlView').replaceWith(this.volumeControlView.render().el);

            this.$el.find('#previousButtonView').replaceWith(this.previousButtonView.render().el);
            this.$el.find('#playPauseButtonView').replaceWith(this.playPauseButtonView.render().el);
            this.$el.find('#nextButtonView').replaceWith(this.nextButtonView.render().el);

            this.title = this.$el.find('.title');

            return this;
        },

        initialize: function () {
            this.videoView = new VideoView();
            this.listenTo(VideoDisplayButton, 'change:enabled', this.hideOnDisabled);
            this.listenTo(StreamItems, 'change:selected', this.updateTitle);
            
            this.playPauseButtonView = new PlayPauseButtonView();
            this.previousButtonView = new PreviousButtonView();
            this.nextButtonView = new NextButtonView();
            this.volumeControlView = new VolumeControlView();

            //  TODO: TimeProgressAreaView is still useful, hopefully.
            //this.timeProgressAreaView = new TimeProgressAreaView();
            //this.videoDisplayButtonView = new VideoDisplayButtonView();
        },
        
        toggleVideoDisplay: function () {
            VideoDisplayButton.toggleEnabled();
            console.log("VideoDisplayButton is now:", VideoDisplayButton.get('enabled'));
        },
        
        hideOnDisabled: function() {
            var enabled = VideoDisplayButton.get('enabled');

            if (!enabled) {
                this.hide();
            }
        },

        show: function (instant) {

            //  Store original values in data attribute to be able to revert without magic numbers.
            this.$el.data('background', this.$el.css('background')).transition({
                'background': 'rgba(0, 0, 0, 0.5)'
            }, instant ? 0 : undefined, 'snap');

            this.panel.transition({
                x: this.$el.width()
            }, instant ? 0 : undefined, 'snap');
            
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
           
        },
        
        updateTitle: function() {
            this.title.text(StreamItems.getSelectedItem().get('title'));
        }
    });

    return VideoDisplayView;
});