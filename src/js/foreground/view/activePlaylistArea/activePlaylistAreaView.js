define([
    'foreground/view/genericForegroundView',
    'foreground/model/foregroundViewManager',
    'text!template/activePlaylistArea.html',
    'foreground/view/activePlaylistArea/playAllButtonView',
    'foreground/view/activePlaylistArea/addAllButtonView',
    'foreground/view/activePlaylistArea/searchButtonView',
    'foreground/view/multiSelectCompositeView',
    'foreground/collection/contextMenuGroups',
    'foreground/view/activePlaylistArea/playlistItemView'
], function (GenericForegroundView, ForegroundViewManager, ActivePlaylistAreaTemplate, PlayAllButtonView, AddAllButtonView, SearchButtonView, MultiSelectCompositeView, ContextMenuGroups, PlaylistItemView) {
    'use strict';

    var ActivePlaylistAreaView = MultiSelectCompositeView.extend({

        className: 'left-pane',
        id: 'activePlaylistArea',
        
        template: _.template(ActivePlaylistAreaTemplate),
        
        itemViewContainer: '#activePlaylistItems',

        itemView: PlaylistItemView,
        
        itemViewOptions: function (model, index) {
            return {
                //  TODO: I used to have more complex logic for doing this which actually calculated whether the item was visible or not. Is that still needed? If so, why?
                //  I think it might be needed for dragging an item.
                //  TODO: This is hardcoded. Need to calculate whether a search result is visible or not.
                instant: index <= 8
            };
        },

        ui: {
            playlistDetails: '.playlist-details',
            playlistTitle: '.playlistTitle',
            playlistEmptyMessage: 'div.playlistEmpty',
            bottomMenubar: '.left-bottom-menubar',
            activePlaylistItems: '#activePlaylistItems'
        },
        
        events: _.extend({}, MultiSelectCompositeView.prototype.events, {
            'input @ui.searchInput': 'showVideoSuggestions',
            'click button#hideVideoSearch': 'destroyModel',
            'contextmenu @ui.activePlaylistItems': 'showContextMenu'
        }),

        templateHelpers: {
            //  Mix in chrome to reference internationalize.
            'chrome.i18n': chrome.i18n
        },
        
        modelEvents: {
            'change:displayInfo': 'updatePlaylistDetails',
            'change:title': 'updatePlaylistTitle'
        },
        
        collectionEvents: {
            'add remove reset': function() {
                this.toggleBigText();
                this.toggleBottomMenubar();
            }
        },
        
        onRender: function () {            
            var searchButtonView = new SearchButtonView({
                mode: this.model
            });
            this.$el.find('#searchButtonView').replaceWith(searchButtonView.render().el);
            
            var playAllButtonView = new PlayAllButtonView({
                model: this.model
            });
            this.$el.find('#playAllButtonView').replaceWith(playAllButtonView.render().el);

            var addAllButtonView = new AddAllButtonView({
                model: this.model
            });
            this.$el.find('#addAllButtonView').replaceWith(addAllButtonView.render().el);

            GenericForegroundView.prototype.initializeTooltips.call(this);
            this.toggleBigText();
            this.toggleBottomMenubar();
            
            //  TODO: Is there a better way to do this?
            MultiSelectCompositeView.prototype.onRender.call(this, arguments);
        },

        initialize: function () {
            ForegroundViewManager.subscribe(this);
        },
        
        updatePlaylistDetails: function () {
            this.ui.playlistDetails.text(this.model.get('displayInfo'));
        },
        
        updatePlaylistTitle: function () {
            var playlistTitle = this.model.get('title');
            this.ui.playlistTitle.text(playlistTitle);
            this.ui.playlistTitle.qtip('option', 'content.text', playlistTitle);
        },
        
        //  Set the visibility of any visible text messages.
        toggleBigText: function() {
            var isPlaylistEmpty = this.collection.length === 0;
            this.ui.playlistEmptyMessage.toggleClass('hidden', !isPlaylistEmpty);
        },
        
        toggleBottomMenubar: function() {
            var isPlaylistEmpty = this.collection.length === 0;
            
            if (isPlaylistEmpty) {
                this.ui.bottomMenubar.hide();
            } else {
                this.ui.bottomMenubar.show();
            }
        },
        
        showContextMenu: function (event) {

            //  Whenever a context menu is shown -- set preventDefault to true to let foreground know to not reset the context menu.
            event.preventDefault();

            if (event.target === event.currentTarget || $(event.target).hasClass('big-text') || $(event.target).hasClass('i-4x')) {
                //  Didn't bubble up from a child -- clear groups.
                ContextMenuGroups.reset();

                var isPlaylistEmpty = this.collection.length === 0;

                ContextMenuGroups.add({
                    items: [{
                        text: chrome.i18n.getMessage('enqueuePlaylist'),
                        disabled: isPlaylistEmpty,
                        title: isPlaylistEmpty ? chrome.i18n.getMessage('playlistEmpty') : '',
                        onClick: function () {

                            if (!isPlaylistEmpty) {
                                StreamItems.addByPlaylistItems(this.model, false);
                            }

                        }.bind(this)
                    }, {
                        text: chrome.i18n.getMessage('playPlaylist'),
                        disabled: isPlaylistEmpty,
                        title: isPlaylistEmpty ? chrome.i18n.getMessage('playlistEmpty') : '',
                        onClick: function () {

                            if (!isPlaylistEmpty) {
                                StreamItems.addByPlaylistItems(this.model, true);
                            }

                        }.bind(this)
                    }]
                });

            }

        }
    });

    return ActivePlaylistAreaView;
});