define([
    'foreground/model/foregroundViewManager',
    'text!template/activePlaylistArea.html',
    'foreground/view/multiSelectCompositeView',
    'foreground/view/activePlaylistArea/playlistItemView',
    'foreground/model/user',
    'foreground/collection/streamItems'
], function (ForegroundViewManager, ActivePlaylistAreaTemplate, MultiSelectCompositeView, PlaylistItemView, User, StreamItems) {
    'use strict';

    var ActivePlaylistAreaView = MultiSelectCompositeView.extend({

        id: 'activePlaylistArea',
        className: 'left-pane',
        template: _.template(ActivePlaylistAreaTemplate),
        itemView: PlaylistItemView,
        itemViewContainer: '#activePlaylistItems',

        ui: {
            playlistDetails: '.playlist-details',
            playlistTitle: '.playlistTitle',
            playlistEmptyMessage: 'div.playlistEmpty',
            signingInMessage: 'div.signingIn',
            signInPrompt: 'div.signIn',
            signInLink: 'div.signIn .clickable',
            signInFailedMessage: 'div.signInFailed',
            bottomMenubar: '.left-bottom-menubar',
            itemContainer: '#activePlaylistItems',
            signInRetryTimer: '#signInRetryTimer'
        },
        
        events: _.extend({}, MultiSelectCompositeView.prototype.events, {
            'input @ui.searchInput': 'showVideoSuggestions',
            'click button#hideVideoSearch': 'destroyModel',
            'click button.addAll': 'addAllToStream',
            'click button.playAll': 'playAllInStream',
            'click @ui.signInLink': 'signIn'
        }),

        templateHelpers: function() {
            return {
                openMenuMessage: chrome.i18n.getMessage('openMenu'),
                showVideoSearchMessage: chrome.i18n.getMessage('showVideoSearch'),
                searchForVideosMessage: chrome.i18n.getMessage('searchForVideos'),
                playlistEmptyMessage: chrome.i18n.getMessage('playlistEmpty'),
                wouldYouLikeToMessage: chrome.i18n.getMessage('wouldYouLikeTo'),
                signingInMessage: chrome.i18n.getMessage('signingIn'),
                signInMessage: chrome.i18n.getMessage('signIn'),
                enqueueAllMessage: chrome.i18n.getMessage('enqueueAll'),
                playAllMessage: chrome.i18n.getMessage('playAll'),
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
            this.listenTo(User, 'change:signedIn change:signingIn change:signInFailed', this.toggleBigText);
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

            var userSignedIn = User.get('signedIn');
            var userSigningIn = User.get('signingIn');
            var userSignInFailed = User.get('signInFailed');

            console.log("userSignedIn, signingin, failed", userSignedIn, userSigningIn, userSignInFailed);

            this.ui.signInFailedMessage.toggleClass('hidden', !userSignInFailed);
            this.ui.signingInMessage.toggleClass('hidden', userSignedIn && !userSigningIn);
            this.ui.signInPrompt.toggleClass('hidden', userSignedIn || userSigningIn);
            this.ui.playlistEmptyMessage.toggleClass('hidden', !userSignedIn || this.collection.length > 0);
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