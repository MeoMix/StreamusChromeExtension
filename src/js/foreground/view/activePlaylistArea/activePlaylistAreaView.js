define([
    'foreground/view/genericForegroundView',
    'foreground/model/foregroundViewManager',
    'text!template/activePlaylistArea.html',
    'foreground/view/multiSelectCompositeView',
    'foreground/collection/contextMenuGroups',
    'foreground/view/activePlaylistArea/playlistItemView',
    'foreground/model/user',
    'foreground/collection/streamItems'
], function (GenericForegroundView, ForegroundViewManager, ActivePlaylistAreaTemplate, MultiSelectCompositeView, ContextMenuGroups, PlaylistItemView, User, StreamItems) {
    'use strict';

    var ActivePlaylistAreaView = MultiSelectCompositeView.extend({

        id: 'activePlaylistArea',
        className: 'left-pane',
        template: _.template(ActivePlaylistAreaTemplate),
        itemView: PlaylistItemView,
        itemViewContainer: '#activePlaylistItems',
        isFullyVisible: true,

        ui: {
            playlistDetails: '.playlist-details',
            playlistTitle: '.playlistTitle',
            playlistEmptyMessage: 'div.playlistEmpty',
            signingInMessage: 'div.signingIn',
            signInPrompt: 'div.signIn',
            signInFailedMessage: 'div.signInFailed',
            bottomMenubar: '.left-bottom-menubar',
            multiSelectItemContainer: '#activePlaylistItems',
            signInRetryTimer: '#signInRetryTimer'
        },
        
        events: _.extend({}, MultiSelectCompositeView.prototype.events, {
            'input @ui.searchInput': 'showVideoSuggestions',
            'click button#hideVideoSearch': 'destroyModel',
            'click button.addAll': 'addAllToStream',
            'click button.playAll': 'playAllInStream',
            'click @ui.signInPrompt': 'signIn'
        }),

        templateHelpers: function() {
            return {
                openMenu: chrome.i18n.getMessage('openMenu'),
                showVideoSearch: chrome.i18n.getMessage('showVideoSearch'),
                searchForVideos: chrome.i18n.getMessage('searchForVideos'),
                playlistEmpty: chrome.i18n.getMessage('playlistEmpty'),
                wouldYouLikeTo: chrome.i18n.getMessage('wouldYouLikeTo'),
                signingIn: chrome.i18n.getMessage('signingIn'),
                signInMessage: chrome.i18n.getMessage('signIn'),
                enqueueAll: chrome.i18n.getMessage('enqueueAll'),
                playAll: chrome.i18n.getMessage('playAll'),
                signInFailedMessage: chrome.i18n.getMessage('signInFailed'),
                pleaseWaitMessage: chrome.i18n.getMessage('pleaseWait'),
                signInRetryTimer: User.get('signInRetryTimer'),
                playlistTitle: this.model ? this.model.get('title') : '',
                playlistDisplayInfo: this.model ? this.model.get('displayInfo') : ''
            };
        },
        
        modelEvents: {
            'change:displayInfo': 'updatePlaylistDetails',
            'change:title': 'updatePlaylistTitle'
        },
        
        collectionEvents: {
            'add remove reset': function() {
                this.toggleBigText();
                this.toggleBottomMenubar();
            }
        },
        
        onAfterItemAdded: function (view) {
            if (this.isFullyVisible) {
                view.ui.imageThumbnail.lazyload({
                    container: this.ui.streamItems,
                    threshold: 250
                });
            }
        },

        onShow: function () {

            //  TODO: onShow should guarantee that view is ready, but I think because this is a Chrome extension
            //  the fact that the extension is still opening up changes things?
            setTimeout(function () {

                $(this.children.map(function (child) {
                    return child.ui.imageThumbnail.toArray();
                })).lazyload({
                    container: this.ui.streamItems,
                    threshold: 250
                });

                this.isFullyVisible = true;
            }.bind(this));
        },
        
        onRender: function () {            
            GenericForegroundView.prototype.initializeTooltips.call(this);
            
            this.toggleBigText();
            this.toggleBottomMenubar();

            MultiSelectCompositeView.prototype.onRender.call(this, arguments);
        },

        initialize: function () {
            ForegroundViewManager.subscribe(this);
            this.listenTo(User, 'change:loaded change:signingIn change:signInFailed', this.toggleBigText);
            this.listenTo(User, 'change:signInRetryTimer', this.updateSignInRetryTimer);
        },
        
        updateSignInRetryTimer: function () {
            this.ui.signInRetryTimer.text(User.get('signInRetryTimer'));
        },
        
        updatePlaylistDetails: function () {
            this.ui.playlistDetails.text(this.model.get('displayInfo'));
        },
        
        updatePlaylistTitle: function () {
            var playlistTitle = this.model.get('title');
            this.ui.playlistTitle.text(playlistTitle);
            this.ui.playlistTitle.qtip('option', 'content.text', playlistTitle);
        },
        
        //  Set the visibility of any visible text messages.
        toggleBigText: function () {

            var userLoaded = User.get('loaded');
            var userSigningIn = User.get('signingIn');
            var userSignInFailed = User.get('signInFailed');

            console.log("loaded, signingin, failed", userLoaded, userSigningIn, userSignInFailed);

            this.ui.signInFailedMessage.toggleClass('hidden', !userSignInFailed);
            this.ui.signingInMessage.toggleClass('hidden', userLoaded && !userSigningIn);
            this.ui.signInPrompt.toggleClass('hidden', userLoaded || userSigningIn);
            this.ui.playlistEmptyMessage.toggleClass('hidden', !userLoaded || this.collection.length > 0);
        },
        
        toggleBottomMenubar: function () {
            var playlistIsLoaded = !_.isUndefined(this.collection);
            
            if (playlistIsLoaded) {
                var isPlaylistEmpty = this.collection.length === 0;

                if (isPlaylistEmpty) {
                    this.ui.bottomMenubar.hide();
                } else {
                    this.ui.bottomMenubar.show();
                }
            } else {
                this.ui.bottomMenubar.hide();
            }
        },
        
        showContextMenu: function (event) {

            //  Whenever a context menu is shown -- set preventDefault to true to let foreground know to not reset the context menu.
            event.preventDefault();

            if (event.target === event.currentTarget || $(event.target).hasClass('big-text') || $(event.target).hasClass('i-4x')) {
                //  Didn't bubble up from a child -- clear groups.
                ContextMenuGroups.reset();

                var isPlaylistEmpty = _.isUndefined(this.collection) || this.collection.length === 0;

                ContextMenuGroups.add({
                    items: [{
                        text: chrome.i18n.getMessage('enqueuePlaylist'),
                        disabled: isPlaylistEmpty,
                        title: isPlaylistEmpty ? chrome.i18n.getMessage('playlistEmpty') : '',
                        onClick: function () {
                            StreamItems.addByPlaylistItems(this.model, false);
                        }.bind(this)
                    }, {
                        text: chrome.i18n.getMessage('playPlaylist'),
                        disabled: isPlaylistEmpty,
                        title: isPlaylistEmpty ? chrome.i18n.getMessage('playlistEmpty') : '',
                        onClick: function () {
                            StreamItems.addByPlaylistItems(this.model, true);
                        }.bind(this)
                    }]
                });

            }

        },

        addAllToStream: function () {
            StreamItems.addByPlaylistItems(this.model.get('items'), false);
        },
        
        playAllInStream: function() {
            StreamItems.addByPlaylistItems(this.model.get('items'), true);
        },
        
        signIn: function() {
            User.signIn();
        }
    });

    return ActivePlaylistAreaView;
});