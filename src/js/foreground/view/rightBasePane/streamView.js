define([
    'foreground/eventAggregator',
    'foreground/view/streamusCompositeView',
    'foreground/model/foregroundViewManager',
    'text!template/stream.html',
    'common/enum/listItemType',
    'foreground/model/streamAction',
    'foreground/view/rightBasePane/streamItemView',
    'background/collection/playlists',
    'background/collection/videoSearchResults',
    'background/model/user',
    'background/model/buttons/shuffleButton',
    'background/model/buttons/repeatButton',
    'background/model/buttons/radioButton',
    'common/enum/repeatButtonState'
], function (EventAggregator, StreamusCompositeView, ForegroundViewManager, StreamTemplate, ListItemType, StreamAction, StreamItemView, Playlists, VideoSearchResults, User, ShuffleButton, RepeatButton, RadioButton, RepeatButtonState) {
    'use strict';
    
    var StreamView = StreamusCompositeView.extend({
        
        id: 'stream',
        
        template: _.template(StreamTemplate),
        itemViewContainer: '#streamItems',

        itemView: StreamItemView,

        events: {
            'click button#clearStream': 'clear',
            'click @ui.enabledSaveStreamButton': 'save',
            'scroll @ui.streamItems': 'loadVisible',
            'click @ui.shuffleButton': 'toggleShuffle',
            'click @ui.radioButton': 'toggleRadio',
            'click @ui.repeatButton': 'toggleRepeat',
            
            'click @ui.showVideoSearch': function () {
                EventAggregator.trigger('streamView:showVideoSearch');
            }
        },
        
        ui: {
            streamEmptyMessage: '.streamEmpty',
            contextButtons: '.context-buttons',
            saveStreamButton: 'button#saveStream',
            enabledSaveStreamButton: 'button#saveStream:not(.disabled)',
            itemContainer: '#streamItems',
            shuffleButton: '#shuffle-button',
            radioButton: '#radio-button',
            repeatButton: '#repeat-button',
            showVideoSearch: '.showVideoSearch'
        },
        
        templateHelpers: function () {
            return {
                streamEmptyMessage: chrome.i18n.getMessage('streamEmpty'),
                saveStreamMessage: chrome.i18n.getMessage('saveStream'),
                clearStreamMessage: chrome.i18n.getMessage('clearStream'),
                searchForVideosMessage: chrome.i18n.getMessage('searchForVideos'),
                whyNotAddAVideoFromAPlaylistOrMessage: chrome.i18n.getMessage('whyNotAddAVideoFromAPlaylistOr'),
                cantSaveNotSignedInMessage: chrome.i18n.getMessage('cantSaveNotSignedIn'),
                userSignedIn: User.get('signedIn')
            };
        },

        onShow: function () {
            this.onFullyVisible();
        },
        
        onRender: function () {
            
            this.toggleBigText();
            this.toggleContextButtons();
            this.updateSaveStreamButton();
            
            this.setRepeatButtonState();
            this.setShuffleButtonState();
            this.setRadioButtonState();
            
            if (this.collection.selected().length > 0) {
                this.$el.find('.listItem.selected').scrollIntoView(false);
                this.$el.trigger('scroll');
            }

            var self = this;

            this.$el.find(this.itemViewContainer).sortable({

                connectWith: '.droppable-list',

                cursorAt: {
                    right: 35,
                    bottom: 40
                },

                placeholder: 'sortable-placeholder listItem hiddenUntilChange',

                helper: function (ui, streamItem) {

                    //  Create a new view instead of just copying the HTML in order to preserve HTML->Backbone.View relationship
                    var copyHelperView = new StreamItemView({
                        model: self.collection.get(streamItem.data('id')),
                        //  Don't lazy-load the view because copy helper is clearly visible
                        instant: true
                    });

                    this.copyHelper = copyHelperView.render().$el.insertAfter(streamItem);
                    this.copyHelper.css({
                        opacity: '.5'
                    }).addClass('copyHelper');

                    this.backCopyHelper = streamItem.prev();
                    this.backCopyHelper.addClass('copyHelper');

                    $(this).data('copied', false);

                    return $('<span>', {
                        'class': 'selectedModelsLength',
                        'text': '1'
                    });
                },

                change: function () {
                    //  There's a CSS redraw issue with my CSS selector: .listItem.copyHelper + .sortable-placeholder 
                    //  So, I manually hide the placehelper (like it would be normally) until a change occurs -- then the CSS can take over.
                    $('.hiddenUntilChange').removeClass('hiddenUntilChange');
                },
                start: function (event, ui) {
                    
                    var activePlaylist = Playlists.getActivePlaylist();
                    
                    if (!_.isUndefined(activePlaylist)) {
                        var streamItemId = ui.item.data('id');

                        //  Color the placeholder to indicate that the StreamItem can't be copied into the Playlist.
                        var draggedStreamItem = self.collection.get(streamItemId);

                        var videoAlreadyExists = activePlaylist.get('items').videoAlreadyExists(draggedStreamItem.get('video'));
                        ui.placeholder.toggleClass('noDrop', videoAlreadyExists);
                    } else {
                        ui.placeholder.addClass('noPlaylist');
                    }

                    ui.item.data('sortableItem').scrollParent = ui.placeholder.parent();
                    ui.item.data('sortableItem').overflowOffset = ui.placeholder.parent().offset();
                },
                stop: function () {
                    this.backCopyHelper.removeClass('copyHelper');

                    var copied = $(this).data('copied');
                    if (copied) {
                        this.copyHelper.css({
                            opacity: 1
                        }).removeClass('copyHelper');
                    }
                    else {
                        this.copyHelper.remove();
                    }

                    this.copyHelper = null;
                    this.backCopyHelper = null;

                },
                tolerance: 'pointer',
                receive: function (event, ui) {

                    var listItemType = ui.item.data('type');

                    if (listItemType === ListItemType.PlaylistItem) {
                        var activePlaylistItems = Playlists.getActivePlaylist().get('items');

                        var draggedPlaylistItems = activePlaylistItems.selected();
                        self.collection.addByDraggedPlaylistItems(draggedPlaylistItems, ui.item.index());

                        activePlaylistItems.deselectAll();
                    } else if (listItemType === ListItemType.VideoSearchResult) {
                        var draggedSearchResults = VideoSearchResults.selected();

                        self.collection.addByDraggedVideoSearchResults(draggedSearchResults, ui.item.index());
                        VideoSearchResults.deselectAll();
                    }

                    ui.item.remove();
                    ui.sender.data('copied', true);

                    return false;
                },
                update: function (event, ui) {
                    var listItemType = ui.item.data('type');

                    //  Don't run this code when handling playlist items -- only when reorganizing stream items.
                    if (listItemType === ListItemType.StreamItem) {

                        //  It's important to do this to make sure I don't count my helper elements in index.
                        var newIndex = parseInt(ui.item.parent().children('.listItem').index(ui.item));

                        var streamItemId = ui.item.data('id');
                        var currentIndex = self.collection.indexOf(self.collection.get(streamItemId));
                        self.collection.models.splice(newIndex, 0, self.collection.models.splice(currentIndex, 1)[0]);

                        //  TODO: Something better than this... would be nice to actually be sorting.. again lends itself
                        //  to using the sequencedCollection for client-side collections, too.
                        self.collection.trigger('sort');
                    }
                },

                over: function (event, ui) {
                    ui.item.data('sortableItem').scrollParent = ui.placeholder.parent();
                    ui.item.data('sortableItem').overflowOffset = ui.placeholder.parent().offset();
                }
            });
        },
        
        collectionEvents: {
            'add remove reset': function() {
                this.toggleBigText();
                this.toggleContextButtons();
                
                //  Trigger a scroll event because an item could slide into view and lazy loading would need to happen.
                this.$el.trigger('scroll');
            }
        },
        
        initialize: function() {
            this.listenTo(User, 'change:signedIn', this.updateSaveStreamButton);

            this.listenTo(ShuffleButton, 'change:enabled', this.setShuffleButtonState);
            this.listenTo(RadioButton, 'change:enabled', this.setRadioButtonState);
            this.listenTo(RepeatButton, 'change:state', this.setRepeatButtonState);

            ForegroundViewManager.subscribe(this);
        },
        
        updateSaveStreamButton: function () {
            var userSignedIn = User.get('signedIn');
            
            var templateHelpers = this.templateHelpers();
            var newTitle = userSignedIn ? templateHelpers.saveStreamMessage : templateHelpers.cantSaveNotSignedInMessage;

            this.ui.saveStreamButton.toggleClass('disabled', !userSignedIn);
            this.ui.saveStreamButton.attr('title', newTitle).qtip('option', 'content.text', newTitle);
        },
        
        //  Hide the empty message if there is anything in the collection
        toggleBigText: function () {
            this.ui.streamEmptyMessage.toggleClass('hidden', this.collection.length > 0);
        },
        
        //  Show buttons if there is anything in the collection otherwise hide
        toggleContextButtons: function () {
            this.ui.contextButtons.toggle(this.collection.length > 0);
        },

        //  TODO: This adds support for a sorted collection, but is slower than using the default implementation which leverages a document fragment.
        //  https://github.com/marionettejs/backbone.marionette/wiki/Adding-support-for-sorted-collections
        //  https://github.com/marionettejs/backbone.marionette/blob/master/docs/marionette.collectionview.md#collectionviews-appendhtml
        appendHtml: function (collectionView, itemView, index) {
            var childrenContainer = collectionView.itemViewContainer ? collectionView.$(collectionView.itemViewContainer) : collectionView.$el;
            var children = childrenContainer.children();
            if (children.size() <= index) {
                childrenContainer.append(itemView.el);
            } else {
                children.eq(index).before(itemView.el);
            }
        },
        
        clear: function() {
            StreamAction.clearStream();
        },
        
        save: function() {
            StreamAction.saveStream();
        },
        
        toggleShuffle: function() {
            ShuffleButton.toggleEnabled();
        },
        
        toggleRadio: function() {
            RadioButton.toggleRadio();
        },
        
        toggleRepeat: function() {
            RepeatButton.toggleRepeat();
        },
        
        setRepeatButtonState: function() {
            var state = RepeatButton.get('state');
            
            //  The button is considered enabled if it is anything but disabled.
            var enabled = state !== RepeatButtonState.Disabled;

            var title = '';
            var icon = $('<i>', { 'class': 'fa fa-repeat' });
            switch (state) {
                case RepeatButtonState.Disabled:
                    title = chrome.i18n.getMessage('repeatDisabled');
                    break;
                case RepeatButtonState.RepeatVideo:
                    title = chrome.i18n.getMessage('repeatVideo');
                    icon = $('<i>', { 'class': 'fa fa-repeat repeatVideo' });
                    break;
                case RepeatButtonState.RepeatStream:
                    title = chrome.i18n.getMessage('repeatStream');
                    icon = $('<i>', { 'class': 'fa fa-repeat repeatStream' });
                    break;
            }

            this.ui.repeatButton.toggleClass('enabled', enabled).attr('title', title).empty().append(icon);
        },
        
        setShuffleButtonState: function() {
            var enabled = ShuffleButton.get('enabled');

            var title;
            if (enabled) {
                title = chrome.i18n.getMessage('shuffleEnabled');
            } else {
                title = chrome.i18n.getMessage('shuffleDisabled');
            }

            this.ui.shuffleButton.toggleClass('enabled', enabled).attr('title', title);
        },
        
        setRadioButtonState: function () {
            var enabled = RadioButton.get('enabled');
            
            var title;
            if (enabled) {
                title = chrome.i18n.getMessage('radioEnabled');
            } else {
                title = chrome.i18n.getMessage('radioDisabled');
            }
            
            this.ui.radioButton.toggleClass('enabled', enabled).attr('title', title);
        }

    });

    return StreamView;
});