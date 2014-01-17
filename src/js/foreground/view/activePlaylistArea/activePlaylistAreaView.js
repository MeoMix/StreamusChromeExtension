define([
    'foreground/view/genericForegroundView',
    'foreground/view/activePlaylistArea/activePlaylistItemsView',
    'text!template/activePlaylistArea.html',
    'foreground/view/activePlaylistArea/playAllButtonView',
    'foreground/view/activePlaylistArea/addAllButtonView',
    'foreground/view/activePlaylistArea/searchButtonView'
], function (GenericForegroundView, ActivePlaylistItemsView, ActivePlaylistAreaTemplate, PlayAllButtonView, AddAllButtonView, SearchButtonView) {
    'use strict';

    var ActivePlaylistAreaView = GenericForegroundView.extend({

        className: 'left-pane',
        
        template: _.template(ActivePlaylistAreaTemplate),
        
        activePlaylistItemsView: null,
        searchButtonView: null,
        addAllButtonView: null,
        playAllButtonView: null,
        playlistDetails: null,
        playlistTitle: null,
        playlistEmptyMessage: null,
        bottomMenubar: null,
        
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

            this.$el.find('#searchButtonView').replaceWith(this.searchButtonView.render().el);
            this.$el.find('#addAllButtonView').replaceWith(this.addAllButtonView.render().el);
            this.$el.find('#playAllButtonView').replaceWith(this.playAllButtonView.render().el);
           
            this.playlistDetails = this.$el.find('.playlist-details');
            this.playlistTitle = this.$el.find('.playlistTitle');
            this.playlistEmptyMessage = this.$el.find('div.playlistEmpty');
            this.bottomMenubar = this.$el.find('.left-bottom-menubar');

            this.initializeTooltips();
            this.toggleBigText();
            this.toggleBottomMenubar();

            return this;
        },

        initialize: function () {

            this.activePlaylistItemsView = new ActivePlaylistItemsView({
                model: this.model.get('playlist').get('items')
            });

            this.searchButtonView = new SearchButtonView({
                mode: this.model.get('playlist')
            });

            this.playAllButtonView = new PlayAllButtonView({
                model: this.model.get('playlist')
            });
            
            this.addAllButtonView = new AddAllButtonView({
                model: this.model.get('playlist')
            });

            this.listenTo(this.model.get('playlist'), 'change:displayInfo', this.updatePlaylistDetails);
            this.listenTo(this.model.get('playlist'), 'change:title', this.updatePlaylistTitle);
            this.listenTo(this.model.get('playlist').get('items'), 'add addMultiple remove reset', function() {
                this.toggleBigText();
                this.toggleBottomMenubar();
            });
 
        },
        
        updatePlaylistDetails: function () {
            this.playlistDetails.text(this.model.get('playlist').get('displayInfo'));
        },
        
        updatePlaylistTitle: function () {
            var playlistTitle = this.model.get('playlist').get('title');
            this.playlistTitle.text(playlistTitle);
            this.playlistTitle.qtip('option', 'content.text', playlistTitle);
        },
        
        //  Set the visibility of any visible text messages.
        toggleBigText: function() {
            var isPlaylistEmpty = this.model.get('playlist').get('items').length === 0;
            this.playlistEmptyMessage.toggleClass('hidden', !isPlaylistEmpty);
        },
        
        toggleBottomMenubar: function() {
            var isPlaylistEmpty = this.model.get('playlist').get('items').length === 0;
            
            if (isPlaylistEmpty) {
                this.bottomMenubar.hide();
            } else {
                this.bottomMenubar.show();
            }
        }
    });

    return ActivePlaylistAreaView;
});