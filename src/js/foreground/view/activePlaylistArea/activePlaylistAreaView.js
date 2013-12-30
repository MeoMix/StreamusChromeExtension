define([
    'foreground/view/genericForegroundView',
    'foreground/view/activePlaylistArea/activePlaylistItemsView',
    'text!template/activePlaylistArea.html',
    'foreground/view/activePlaylistArea/playAllButtonView',
    'foreground/view/activePlaylistArea/addAllButtonView',
    'foreground/collection/streamItems',
    'common/model/utility'
], function (GenericForegroundView, ActivePlaylistItemsView, ActivePlaylistAreaTemplate, PlayAllButtonView, AddAllButtonView, StreamItems, Utility) {
    'use strict';

    var ActivePlaylistAreaView = GenericForegroundView.extend({

        className: 'left-pane',
        
        template: _.template(ActivePlaylistAreaTemplate),
        
        activePlaylistItemsView: null,
        addAllButtonView: null,
        playAllButtonView: null,
        playlistDetails: null,
        playlistTitle: null,
        playlistEmptyMessage: null,
        
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

            this.$el.find('#activePlaylistItemsView').replaceWith(this.activePlaylistItemsView.render().el);

            var playlistActions = this.$el.find('.playlist-actions');

            playlistActions.append(this.addAllButtonView.render().el);
            playlistActions.append(this.playAllButtonView.render().el);
           
            this.playlistDetails = this.$el.find('.playlist-details');
            this.playlistTitle = this.$el.find('.playlistTitle');
            this.playlistEmptyMessage = this.$el.find('div.playlistEmpty');

            this.initializeTooltips();
            this.toggleBigText();

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
            this.listenTo(this.model.get('playlist'), 'change:title', this.updatePlaylistTitle);
            this.listenTo(this.model.get('playlist').get('items'), 'add addMultiple remove empty', this.toggleBigText);
        },
        
        updatePlaylistDetails: function () {
            this.playlistDetails.text(this.model.get('playlist').get('displayInfo'));
        },
        
        updatePlaylistTitle: function() {
            this.playlistTitle.text(this.model.get('playlist').get('title'));
        },
        
        //  Set the visibility of any visible text messages.
        toggleBigText: function() {
            var isPlaylistEmpty = this.model.get('playlist').get('items').length === 0;
            this.playlistEmptyMessage.toggleClass('hidden', !isPlaylistEmpty);
        }
    });

    return ActivePlaylistAreaView;
});