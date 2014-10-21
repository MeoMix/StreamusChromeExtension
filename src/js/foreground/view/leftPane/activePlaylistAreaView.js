define([
    'common/enum/listItemType',
    'foreground/view/behavior/collectionViewMultiSelect',
    'foreground/view/behavior/slidingRender',
    'foreground/view/behavior/sortable',
    'foreground/view/behavior/tooltip',
    'foreground/view/leftPane/playlistItemView',
    'text!template/leftPane/activePlaylistArea.html'
], function (ListItemType, CollectionViewMultiSelect, SlidingRender, Sortable, Tooltip, PlaylistItemView, ActivePlaylistAreaTemplate) {
    'use strict';

    var ActivePlaylistAreaView = Backbone.Marionette.CompositeView.extend({
        id: 'activePlaylistArea',
        className: 'column u-flex--column',
        childView: PlaylistItemView,
        childViewContainer: '@ui.childContainer',
        
        childViewOptions: {
            type: ListItemType.PlaylistItem
        },
        
        template: _.template(ActivePlaylistAreaTemplate),
        
        templateHelpers: function () {
            return {
                showSearchMessage: chrome.i18n.getMessage('showSearch'),
                searchForSongsMessage: chrome.i18n.getMessage('searchForSongs'),
                playlistEmptyMessage: chrome.i18n.getMessage('playlistEmpty'),
                wouldYouLikeToMessage: chrome.i18n.getMessage('wouldYouLikeTo'),
                addAllMessage: chrome.i18n.getMessage('addAll'),
                playAllMessage: chrome.i18n.getMessage('playAll')
            };
        },
        
        //  Overwrite resortView to only render children as expected
        resortView: function () {
            this._renderChildren();
        },

        ui: {
            playlistDetails: '#activePlaylistArea-playlistDetails',
            playlistEmptyMessage: '#activePlaylistArea-playlistEmptyMessage',
            bottomContentBar: '#activePlaylistArea-bottomContentBar',
            childContainer: '#activePlaylistArea-listItems',
            playAll: '#activePlaylistArea-playAllButton',
            addAll: '#activePlaylistArea-addAllButton',
            showSearchLink: '#activePlaylistArea-showSearchLink'
        },
        
        events: {
            'click @ui.addAll': '_addAllToStream',
            'click @ui.playAll': '_playAllInStream',
            'click @ui.showSearchLink': '_showSearch'
        },
        
        modelEvents: {
            'change:displayInfo': '_onModelChangeDisplayInfo'
        },
        
        collectionEvents: {
            'add remove reset': '_setViewState'
        },
        
        behaviors: function () {
            return {
                CollectionViewMultiSelect: {
                    behaviorClass: CollectionViewMultiSelect,
                },
                SlidingRender: {
                    behaviorClass: SlidingRender
                },
                Sortable: {
                    behaviorClass: Sortable
                },
                Tooltip: {
                    behaviorClass: Tooltip
                }
            };
        },
        
        streamItems: null,
        
        initialize: function() {
            this.streamItems = Streamus.backgroundPage.StreamItems;
        },

        onRender: function () {
            this._setViewState();
        },
        
        //  Ensure that the proper UI elements are being shown based on the state of the collection
        _setViewState: function () {
            this._toggleInstructions();
            this._toggleBottomContentBar();
        },
        
        _onModelChangeDisplayInfo: function (model, displayInfo) {
            this._updatePlaylistDetails(displayInfo);
        },

        _updatePlaylistDetails: function (displayInfo) {
            this.ui.playlistDetails.text(displayInfo);
        },
       
        _toggleInstructions: function () {
            this.ui.playlistEmptyMessage.toggleClass('hidden', this.collection.length > 0);
        },
        
        _toggleBottomContentBar: function () {
            this.ui.bottomContentBar.toggleClass('hidden', this.collection.length === 0);
            //  TODO: It would be better to only run this when needed.
            //  Need to update viewportHeight in slidingRender behavior:
            this.triggerMethod('ListHeightUpdated');
        },

        _addAllToStream: function () {
            this.streamItems.addSongs(this.model.get('items').pluck('song'));
        },
        
        _playAllInStream: function () {
            this.streamItems.addSongs(this.model.get('items').pluck('song'), {
                playOnAdd: true
            });
        },

        _showSearch: function () {
            Streamus.channels.global.vent.trigger('showSearch', true);
        }
    });

    return ActivePlaylistAreaView;
});