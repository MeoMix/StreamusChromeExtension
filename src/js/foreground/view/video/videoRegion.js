define(function(require) {
    'use strict';

    //var VideoView = require('foreground/view/video/videoView');
    //  TODO: need to disable rendering of the video when not shown.
    var VideoRegion = Marionette.Region.extend({
        //initialize: function() {
        //    this.listenTo(Streamus.channels.foregroundArea.vent, 'idle', this._onForegroundAreaIdle);
        //    this.listenTo(Streamus.channels.video.commands, 'show:video', this._showVideo);
        //},

        //_onForegroundAreaIdle: function() {
        //    //  If the video view isn't going to be shown right off the bat then it's OK to defer loading until idle so that 
        //    //  the initial load time of the application isn't impacted.
        //    //if (!this.settings.get('openToSearch')) {
        //        this._createVideoView();
        //    //}
        //},

        //_createVideoView: function() {
        //    var videoView = new VideoView({
        //        //  TODO: model?
        //    });

        //    this.show(videoView);
        //    this.listenTo(videoView, 'hide:video', this._hideVideo);
        //},

        //_showVideo: function(options) {
        //    //  If the view should be visible when UI first loads then do not transition.
        //    if (options && options.instant) {
        //        this.$el.addClass('is-instant');
        //    }

        //    this.$el.addClass('is-visible');
        //    this.currentView.triggerMethod('visible');
        //},

        //_hideVideo: function() {
        //    this.$el.removeClass('is-instant is-visible');
        //}
    });

    return VideoRegion;
});