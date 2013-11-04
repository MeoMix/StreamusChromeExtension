define([
    'activePlaylistItemsView',
    'text!../template/activePlaylistArea.htm',
    'playAllButtonView',
    'addAllButtonView',
    'streamItems',
    'utility'
], function (ActivePlaylistItemsView, ActivePlaylistAreaTemplate, PlayAllButtonView, AddAllButtonView, StreamItems, Utility) {
    'use strict';

    var ActivePlaylistAreaView = Backbone.View.extend({

        className: 'left-pane',
        
        template: _.template(ActivePlaylistAreaTemplate),
        
        activePlaylistItemsView: null,
        addAllButtonView: null,
        playAllButtonView: null,
        playlistDetails: null,
        
        attributes: {
            id: 'activePlaylistArea'
        },
        
        events: {
            'click .playAll': 'addToStreamAndPlay',
            'click .addAll': 'addToStream'
        },
        
        render: function () {
            this.$el.html(this.template(this.model.toJSON()));
            
            this.$el.html(this.template(
                _.extend(this.model.toJSON(), {
                    //  Mix in chrome to reference internationalize.
                    'chrome.i18n': chrome.i18n
                })
            ));

            this.$el.find('.left-top-divider').after(this.activePlaylistItemsView.render().el);

            var playlistActions = this.$el.find('.playlist-actions');

            playlistActions.append(this.addAllButtonView.render().el);
            playlistActions.append(this.playAllButtonView.render().el);
           
            this.playlistDetails = this.$el.find('.playlist-details');

            return this;
        },

        initialize: function () {

            this.activePlaylistItemsView = new ActivePlaylistItemsView({
                model: this.model.get('playlist')
            });

            this.playAllButtonView = new PlayAllButtonView({
                model: this.model.get('playlist')
            });
            
            this.addAllButtonView = new AddAllButtonView({
                model: this.model.get('playlist')
            });

            this.listenTo(this.model.get('playlist'), 'change:displayInfo', this.updatePlaylistDetails);
            Utility.scrollChildElements(this.el, '.playlistTitle');
        },
        
        addToStreamAndPlay: function () {
            var playlist = this.model.get('playlist');

            var streamItems = playlist.get('items').map(function (playlistItem, index) {

                return {
                    id: _.uniqueId('streamItem_'),
                    video: playlistItem.get('video'),
                    title: playlistItem.get('title'),
                    selected: index === 0
                };
            });

            StreamItems.addAndPlay(streamItems);
        },
        
        addToStream: function() {
            var playlist = this.model.get('playlist');

            var streamItems = playlist.get('items').map(function (playlistItem) {

                return {
                    id: _.uniqueId('streamItem_'),
                    video: playlistItem.get('video'),
                    title: playlistItem.get('title'),
                };
            });

            StreamItems.add(streamItems);
        },
        
        show: function() {

            this.$el.show().transition({
                opacity: 1
            });

        },
        
        hide: function () {
            
            this.$el.transition({
                opacity: 0
            }, function () {
                $(this).hide();
            });

        },
        
        updatePlaylistDetails: function () {
            this.playlistDetails.text(this.model.get('playlist').get('displayInfo'));
        }

    });

    return ActivePlaylistAreaView;
});