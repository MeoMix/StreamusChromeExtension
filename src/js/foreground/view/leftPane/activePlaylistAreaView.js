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
            childContainer: '#activePlaylistArea-listItems',
            playAllButton: '#activePlaylistArea-playAllButton',
            addAllButton: '#activePlaylistArea-addAllButton',
            showSearchLink: '#activePlaylistArea-showSearchLink'
        },
        
        events: {
            'click @ui.addAllButton:not(.disabled)': '_addAllToStream',
            'click @ui.playAllButton:not(.disabled)': '_playAllInStream',
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
            this.streamItems = Streamus.backgroundPage.stream.get('items');
            this.listenTo(this.streamItems, 'add remove reset', this._toggleButtons);
        },

        onRender: function () {
            this._setViewState();
        },
        
        //  Ensure that the proper UI elements are being shown based on the state of the collection
        _setViewState: function () {
            this._toggleInstructions();
            this._toggleButtons();
        },
        
        _toggleButtons: function () {
            var playlistEmpty = this.collection.length === 0;
            this.ui.playAllButton.toggleClass('disabled', playlistEmpty);

            var duplicatesInfo = this.streamItems.getDuplicatesInfo(this.collection.pluck('song'));
            this.ui.addAllButton.toggleClass('disabled', playlistEmpty || duplicatesInfo.allDuplicates).attr('title', duplicatesInfo.message);
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

        _addAllToStream: function () {
            this.streamItems.addSongs(this.model.get('items').pluck('song'));
        },
        
        _playAllInStream: function () {
            this.streamItems.addSongs(this.model.get('items').pluck('song'), {
                playOnAdd: true
            });
        },

        _showSearch: function () {
            Streamus.channels.searchArea.commands.trigger('show', true);
        }
    });

    return ActivePlaylistAreaView;
});