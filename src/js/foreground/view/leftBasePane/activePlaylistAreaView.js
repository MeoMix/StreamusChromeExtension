define([
    'foreground/view/multiSelectCompositeView',
    'foreground/view/leftBasePane/playlistItemView',
    'text!template/activePlaylistArea.html'
], function (MultiSelectCompositeView, PlaylistItemView, ActivePlaylistAreaTemplate) {
    'use strict';

    var StreamItems = chrome.extension.getBackgroundPage().StreamItems;

    var ActivePlaylistAreaView = MultiSelectCompositeView.extend({

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

        itemView: PlaylistItemView,
        itemViewContainer: '#active-playlist-items',
        
        //  TODO: Fix hardcoding this.. tricky because items are added before onShow and onShow is when the viewportHeight is able to be determined.
        viewportHeight: 350,

        ui: _.extend({}, MultiSelectCompositeView.prototype.ui, {
            playlistDetails: '.playlist-details',
            playlistEmptyMessage: '.playlist-empty',
            bottomMenubar: '.left-bottom-menubar',
            itemContainer: '#active-playlist-items',
            bigTextWrapper: '.big-text-wrapper',
            playAll: '.play-all',
            addAll: '.add-all'
        }),
        
        events: _.extend({}, MultiSelectCompositeView.prototype.events, {
            'click @ui.addAll': 'addAllToStream',
            'click @ui.playAll': 'playAllInStream'
        }),
        
        modelEvents: {
            'change:displayInfo': 'updatePlaylistDetails'
        },
        
        collectionEvents: _.extend({}, MultiSelectCompositeView.prototype.collectionEvents, {
            'add remove reset': function () {
                //  TODO: Is it costly to be calling these every time add/remove happens? Seems like it might be.
                this.toggleBigText();
                this.toggleBottomMenubar();
                
                //  TODO: This isn't being called even though I expect collectionEvents -- how to fix?
                this._setPaddingTop();
                this._setHeight();
            }
        }),
        
        behaviors: {
            MultiSelect: {

            },
            Sortable: {

            }
        },

        onShow: function () {
            this.onFullyVisible();
            
            this.ui.playlistDetails.qtip();
            this.ui.addAll.qtip();
            this.ui.playAll.qtip();
            
            this.children.each(function (child) {
                child.setTitleTooltip(child.ui.title);
            });
        },

        onRender: function () {            
            this.toggleBigText();
            this.toggleBottomMenubar();

            MultiSelectCompositeView.prototype.onRender.apply(this, arguments);
        },
        
        updatePlaylistDetails: function () {
            var displayInfo = this.model.get('displayInfo');

            this.ui.playlistDetails.text(displayInfo);
            
            //  Be sure to call render first or else setting content.text won't actually update it.
            this.ui.playlistDetails.qtip('render');
            this.ui.playlistDetails.qtip('option', 'content.text', displayInfo);
        },
       
        //  Set the visibility of any visible text messages.
        toggleBigText: function () {
            this.ui.playlistEmptyMessage.toggleClass('hidden', this.collection.length > 0);
        },
        
        toggleBottomMenubar: function () {
            this.ui.bottomMenubar.toggle(this.collection.length > 0);
            this.ui.bigTextWrapper.toggleClass('extended', this.collection.length === 0);
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