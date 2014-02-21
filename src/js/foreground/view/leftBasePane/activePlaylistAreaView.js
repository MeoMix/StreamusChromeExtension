define([
    'foreground/model/foregroundViewManager',
    'text!template/activePlaylistArea.html',
    'foreground/view/multiSelectCompositeView',
    'foreground/view/leftBasePane/playlistItemView',
    'background/collection/streamItems'
], function (ForegroundViewManager, ActivePlaylistAreaTemplate, MultiSelectCompositeView, PlaylistItemView, StreamItems) {
    'use strict';

    var ActivePlaylistAreaView = MultiSelectCompositeView.extend({

        id: 'activePlaylistArea',
        template: _.template(ActivePlaylistAreaTemplate),
        
        templateHelpers: function () {
            return {
                showVideoSearchMessage: chrome.i18n.getMessage('showVideoSearch'),
                searchForVideosMessage: chrome.i18n.getMessage('searchForVideos'),
                playlistEmptyMessage: chrome.i18n.getMessage('playlistEmpty'),
                wouldYouLikeToMessage: chrome.i18n.getMessage('wouldYouLikeTo'),
                enqueueAllMessage: chrome.i18n.getMessage('enqueueAll'),
                playAllMessage: chrome.i18n.getMessage('playAll')
            };
        },

        itemView: PlaylistItemView,
        itemViewContainer: '#activePlaylistItems',

        ui: {
            playlistDetails: '.playlist-details',
            playlistEmptyMessage: 'div.playlistEmpty',
            bottomMenubar: '.left-bottom-menubar',
            itemContainer: '#activePlaylistItems',
            bigTextWrapper: 'div.big-text-wrapper'
        },
        
        events: _.extend({}, MultiSelectCompositeView.prototype.events, {
            'click button.addAll': 'addAllToStream',
            'click button.playAll': 'playAllInStream'
        }),
        
        modelEvents: {
            'change:displayInfo': 'updatePlaylistDetails'
        },
        
        collectionEvents: {
            'add remove reset': function() {
                this.toggleBigText();
                this.toggleBottomMenubar();
            }
        },

        onShow: function () {
            this.onFullyVisible();
        },

        onRender: function () {            
            this.toggleBigText();
            this.toggleBottomMenubar();
            
            this.applyTooltips();
            MultiSelectCompositeView.prototype.onRender.call(this, arguments);
        },

        initialize: function () {
            ForegroundViewManager.subscribe(this);
        },
        
        updatePlaylistDetails: function () {
            this.ui.playlistDetails.text(this.model.get('displayInfo'));
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
            StreamItems.addByPlaylistItems(this.model.get('items'), false);
        },
        
        playAllInStream: function() {
            StreamItems.addByPlaylistItems(this.model.get('items'), true);
        }
    });

    return ActivePlaylistAreaView;
});