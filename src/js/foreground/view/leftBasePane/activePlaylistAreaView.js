define([
    'text!template/activePlaylistArea.html',
    'foreground/view/multiSelectCompositeView',
    'foreground/view/leftBasePane/playlistItemView',
    'background/collection/streamItems'
], function (ActivePlaylistAreaTemplate, MultiSelectCompositeView, PlaylistItemView, StreamItems) {
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
                addAllMessage: chrome.i18n.getMessage('addAll'),
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

                //  Trigger a scroll event to inform lazyloader of possible changes.
                this.ui.itemContainer.trigger('scroll');
            }
        },

        onShow: function () {
            this.onFullyVisible();
            this.applyTooltips();
        },

        onRender: function () {            
            this.toggleBigText();
            this.toggleBottomMenubar();

            MultiSelectCompositeView.prototype.onRender.call(this, arguments);
        },
        
        updatePlaylistDetails: function () {
            var displayInfo = this.model.get('displayInfo');

            this.ui.playlistDetails.text(displayInfo);
            
            //  TODO: Is there a way to use a mutationObserver to monitor text so that content.text will update automatically?
            //  Ensure that the qtip element is rendered before attempting to change its title else its title won't update.
            var qtipApi = this.ui.playlistDetails.qtip('api');

            //  TODO: I pinged the qtip developer indicating I thought this was a bug. Hopefully can get it patched.
            qtipApi.render();
            qtipApi.set('content.text', displayInfo);
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