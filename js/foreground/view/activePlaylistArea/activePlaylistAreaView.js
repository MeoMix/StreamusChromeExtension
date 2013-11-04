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