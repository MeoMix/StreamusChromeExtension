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

    var StreamItems = chrome.extension.getBackgroundPage().StreamItems;

    var ActivePlaylistAreaView = Backbone.Marionette.CompositeView.extend({
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
            this.renderChildren();
        },
        
        childViewOptions: {
            type: ListItemType.PlaylistItem
        },

        ui: {
            playlistDetails: '.playlist-details',
            playlistEmptyMessage: '.playlist-empty',
            bottomMenubar: '.left-bottom-menubar',
            childContainer: '#active-playlist-items',
            bigTextWrapper: '.big-text-wrapper',
            playAll: '.play-all',
            addAll: '.add-all'
        },
        
        events: {
            'click @ui.addAll': 'addAllToStream',
            'click @ui.playAll': 'playAllInStream'
        },
        
        modelEvents: {
            'change:displayInfo': 'updatePlaylistDetails'
        },
        
        collectionEvents: {
            'add remove reset': function () {
                this.toggleBigText();
                this.toggleBottomMenubar();
            }
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
        
        initialize: function () {
            this.listenTo(Backbone.Wreqr.radio.channel('global').vent, 'clickedElement', this._onClickedElement);
        },

        onRender: function () {            
            this.toggleBigText();
            this.toggleBottomMenubar();
        },
        
        onDestroy: function () {
            //  Forget selected items when the view is destroyed.
            this.deselectCollection();
        },
        
        _onClickedElement: function (listItemType) {
            if (listItemType !== this.childViewOptions.type) {
                this.deselectCollection();
            }
        },
        
        deselectCollection: function () {
            this.collection.deselectAll();
        },
        
        updatePlaylistDetails: function () {
            var displayInfo = this.model.get('displayInfo');
            this.ui.playlistDetails.text(displayInfo);
        },
       
        //  Set the visibility of any visible text messages.
        toggleBigText: function () {
            this.ui.playlistEmptyMessage.toggleClass('hidden', this.collection.length > 0);
        },
        
        toggleBottomMenubar: function () {
            var extended = this.ui.bigTextWrapper.hasClass('extended');
            var doToggle = (extended && this.collection.length > 0) || (!extended && this.collection.length === 0);

            if (doToggle) {
                this.ui.bottomMenubar.toggle(this.collection.length > 0);
                this.ui.bigTextWrapper.toggleClass('extended', this.collection.length === 0);

                //  Need to update viewportHeight in slidingRender behavior:
                this.triggerMethod('ListHeightUpdated');
            }
        },

        addAllToStream: function () {
            StreamItems.addSongs(this.model.get('items').pluck('song'));
        },
        
        playAllInStream: function() {
            StreamItems.addSongs(this.model.get('items').pluck('song'), {
                playOnAdd: true
            });
        }
    });

    return ActivePlaylistAreaView;
});