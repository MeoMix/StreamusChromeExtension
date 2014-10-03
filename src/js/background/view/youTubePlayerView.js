define([
    'background/model/youTubePlayer'
], function (YouTubePlayer) {
    'use strict';

    var YouTubePlayerView = Backbone.Marionette.ItemView.extend({
        tagName: 'iframe',
        id: 'youtube-player',
        template: false,
        model: YouTubePlayer,

        attributes: {
            name: 'youtube-player',
            frameborder: 0,
            allowfullscreen: 1,
            title: 'YouTube player',
            width: 640,
            height: 360
        },

        modelEvents: {
            'change:apiReady': '_onChangeApiReady'
        },

        initialize: function () {
            this.model.set('iframeId', this.el.id);
        },

        onShow: function () {
            if (this.model.get('apiReady')) {
                this.model.load();
                this._setSrc();
            } else {
                this.model.loadApi();
            }
        },

        _onChangeApiReady: function (model, apiReady) {
            if (apiReady) {
                this._setSrc();
            }
        },

        _setSrc: function () {
            this.model.get('api').set('iframeRequestCompleted', false);
            //  Set this manually after constructing the iframe because I need to be able to intercept headers being sent during its construction.
            this.$el.attr('src', 'https://www.youtube.com/embed/?enablejsapi=1&origin=chrome-extension:\\\\jbnkffmindojffecdhbbmekbmkkfpmjd');
        }
    });

    return YouTubePlayerView;
});