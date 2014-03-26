define([
    'background/collection/streamItems',
    'foreground/view/multiSelectCompositeView',
    'foreground/view/leftBasePane/playlistItemView',
    'text!template/activePlaylistArea.html'
], function (StreamItems, MultiSelectCompositeView, PlaylistItemView, ActivePlaylistAreaTemplate) {
    'use strict';

    var ActivePlaylistAreaView = MultiSelectCompositeView.extend({

        template: _.template(ActivePlaylistAreaTemplate),
        
        templateHelpers: function () {
            return {
                showSearchMessage: chrome.i18n.getMessage('showSearch'),
                searchForVideosMessage: chrome.i18n.getMessage('searchForVideos'),
                playlistEmptyMessage: chrome.i18n.getMessage('playlistEmpty'),
                wouldYouLikeToMessage: chrome.i18n.getMessage('wouldYouLikeTo'),
                addAllMessage: chrome.i18n.getMessage('addAll'),
                playAllMessage: chrome.i18n.getMessage('playAll')
            };
        },

        itemView: PlaylistItemView,
        //  TODO: Why isn't it possible to reference itemViewContainer from UI?
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
        
        events: _.extend({}, MultiSelectCompositeView.prototype.events, {
            'click @ui.addAll': 'addAllToStream',
            'click @ui.playAll': 'playAllInStream'
        }),
        
        modelEvents: {
            'change:displayInfo': 'updatePlaylistDetails'
        },
        
        collectionEvents: {
            'add remove reset': function () {
                this.toggleBigText();
                this.toggleBottomMenubar();

                //  Trigger a scroll event to inform lazyloader of possible changes.
                this.ui.itemContainer.trigger('scroll');
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

            MultiSelectCompositeView.prototype.onRender.call(this, arguments);
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
            StreamItems.addBySources(this.model.get('items').pluck('source'), false);
        },
        
        playAllInStream: function() {
            StreamItems.addBySources(this.model.get('items').pluck('source'), true);
        }
    });

    return ActivePlaylistAreaView;
});