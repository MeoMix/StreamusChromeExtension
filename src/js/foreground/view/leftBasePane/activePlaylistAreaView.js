define([
    'common/enum/listItemType',
    'foreground/view/behavior/multiSelect',
    'foreground/view/behavior/slidingRender',
    'foreground/view/behavior/sortable',
    'foreground/view/behavior/tooltip',
    'foreground/view/leftBasePane/playlistItemView',
    'text!template/activePlaylistArea.html'
], function (ListItemType, MultiSelect, SlidingRender, Sortable, Tooltip, PlaylistItemView, ActivePlaylistAreaTemplate) {
    'use strict';

    var StreamItems = Streamus.backgroundPage.StreamItems;

    var ActivePlaylistAreaView = Backbone.Marionette.CompositeView.extend({
        className: 'active-playlist-area full flex-column',
        childView: PlaylistItemView,
        childViewContainer: '@ui.childContainer',
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
        
        childViewOptions: {
            type: ListItemType.PlaylistItem
        },

        ui: {
            playlistDetails: '.playlist-details',
            playlistEmptyMessage: '.playlist-empty',
            bottomBar: '.bottom-bar',
            childContainer: '.active-playlist-items',
            bigTextWrapper: '.big-text-wrapper',
            playAll: '.play-all',
            addAll: '.add-all'
        },
        
        events: {
            'click @ui.addAll': '_addAllToStream',
            'click @ui.playAll': '_playAllInStream'
        },
        
        modelEvents: {
            'change:displayInfo': '_onModelChangeDisplayInfo'
        },
        
        collectionEvents: {
            'add remove reset': '_setViewState'
        },
        
        behaviors: function () {
            return {
                MultiSelect: {
                    behaviorClass: MultiSelect,
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

        onRender: function () {
            this._setViewState();
        },
        
        //  Ensure that the proper UI elements are being shown based on the state of the collection
        _setViewState: function () {
            this._toggleBigText();
            this._toggleBottomBar();
        },
        
        _onModelChangeDisplayInfo: function (model, displayInfo) {
            this._updatePlaylistDetails(displayInfo);
        },

        _updatePlaylistDetails: function (displayInfo) {
            this.ui.playlistDetails.text(displayInfo);
        },
       
        //  Set the visibility of any visible text messages.
        _toggleBigText: function () {
            this.ui.playlistEmptyMessage.toggleClass('hidden', this.collection.length > 0);
        },
        
        _toggleBottomBar: function () {
            this.ui.bottomBar.toggle(this.collection.length > 0);
            //  Need to update viewportHeight in slidingRender behavior:
            this.triggerMethod('ListHeightUpdated');
        },

        _addAllToStream: function () {
            StreamItems.addSongs(this.model.get('items').pluck('song'));
        },
        
        _playAllInStream: function () {
            StreamItems.addSongs(this.model.get('items').pluck('song'), {
                playOnAdd: true
            });
        }
    });

    return ActivePlaylistAreaView;
});