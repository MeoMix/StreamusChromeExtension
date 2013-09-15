define([
    'utility'
], function (Utility) {
    'use strict';
    
    var PlaylistView = Backbone.View.extend({
        tagName: 'li',
        
        className: 'playlist',
        
        template: _.template($('#playlistTemplate').html()),
        
        attributes: function () {
            return {
                'data-playlistid': this.model.get('id')
            };
        },

        render: function() {
            this.$el.html(this.template(this.model.toJSON()));
            return this;
        },
        
        initialize: function () {
            this.listenTo(this.model, 'change:title', this.render);
            this.listenTo(this.model, 'destroy', this.remove);

            this.listenTo(this.model.get('items'), 'add remove', this.updateDescription);
        },

        updateDescription: _.throttle(function () {

            var currentItems = this.model.get('items');
            var currentVideos = currentItems.map(function (currentItem) {
                return currentItem.get('video');
            });

            var currentVideosDurations = currentVideos.map(function (currentVideo) {
                return currentVideo.get('duration');
            });

            var sumVideosDurations = _.reduce(currentVideosDurations, function (memo, duration) {
                return memo + duration;
            }, 0);

            var playlistInfo = 'Videos: ' + currentVideos.length + ', Duration: ' + Utility.prettyPrintTime(sumVideosDurations);
            this.$el.find('.playlistInfo').text(playlistInfo);

        }, 100)

    });

    return PlaylistView;
});