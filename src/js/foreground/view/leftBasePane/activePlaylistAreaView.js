define([
    'foreground/view/leftBasePane/playlistItemView',
    'text!template/activePlaylistArea.html'
], function (PlaylistItemView, ActivePlaylistAreaTemplate) {
    'use strict';

    var StreamItems = chrome.extension.getBackgroundPage().StreamItems;

    var ActivePlaylistAreaView = Backbone.Marionette.CompositeView.extend({

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

        ui: {
            playlistDetails: '.playlist-details',
            playlistEmptyMessage: '.playlist-empty',
            bottomMenubar: '.left-bottom-menubar',
            itemContainer: '#active-playlist-items',
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
                console.log("toggling big text");
                //  TODO: Is it costly to be calling these every time add/remove happens? Seems like it might be.
                this.toggleBigText();

                console.log("toggling bottom menu bar");
                this.toggleBottomMenubar();
            }
        },
        
        behaviors: function () {
            return {
                MultiSelect: {
                    
                },
                Sortable: {
                    
                },
                TooltipOnFullyVisible: {
                    
                },

                SlidingRender: {
                    viewportHeight: this._getViewportHeight()
                }
            };
        },

        onShow: function () {
            this.ui.playlistDetails.qtip();
            this.ui.addAll.qtip();
            this.ui.playAll.qtip();

            this.triggerMethod('FullyVisible');
        },

        onRender: function () {            
            this.toggleBigText();
            this.toggleBottomMenubar();
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
            //  TODO: I could keep extended on a model to keep track instead of hitting DOM, but should be OK to fudge a bit.
            var extended = this.ui.bigTextWrapper.hasClass('extended');
            var doToggle = (extended && this.collection.length > 0) || (!extended && this.collection.length === 0);

            if (doToggle) {
                this.ui.bottomMenubar.toggle(this.collection.length > 0);
                this.ui.bigTextWrapper.toggleClass('extended', this.collection.length === 0);

                console.log("HELLO I AM NOW CHANGING VIEWPORT HEIGHT");

                console.log("Viewport height:", this._getViewportHeight());

                //  Need to update viewportHeight in slidingRender behavior:
                this.triggerMethod('SetViewportHeight', {
                    viewportHeight: this._getViewportHeight()
                });
            }
        },
        
        //  TODO: This is hardcoded and should be fixed. Difference between extended and regular is 35px.
        _getViewportHeight: function () {
            //  TODO: Fix hardcoding this.. tricky because items are added before onShow and onShow is when the viewportHeight is able to be determined.
            //  NOTE: Need to access through this.options because this.collection isn't defined when initializing behavior.
            return this.options.collection.length === 0 ? 350 : 315;
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