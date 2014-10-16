define([
    'foreground/view/behavior/tooltip',
    'foreground/view/leftPane/activePlaylistAreaView',
    'foreground/view/leftPane/playlistTitleView',
    'foreground/view/leftPane/signInView',
    'text!template/leftPane/leftPane.html'
], function (Tooltip, ActivePlaylistAreaView, PlaylistTitleView, SignInView, LeftPaneTemplate) {
    'use strict';

    var LeftPaneView = Backbone.Marionette.LayoutView.extend({
        id: 'leftPane',
        className: 'leftPane column u-flex--column',
        template: _.template(LeftPaneTemplate),
        
        templateHelpers: function () {
            return {
                showSearchMessage: chrome.i18n.getMessage('showSearch')
            };
        },

        ui: {
            showSearchButton: '#leftPane-showSearchButton',
            showPlaylistsAreaButton: '#leftPane-showPlaylistsAreaButton',
            playlistTitleRegion: '#leftPane-playlistTitleRegion',
            contentRegion: '#leftPane-contentRegion'
        },
        
        events: {
            'click @ui.showSearchButton': '_showSearch',
            'click @ui.showPlaylistsAreaButton': '_showPlaylistsArea'
        },

        regions: {
            playlistTitleRegion: '@ui.playlistTitleRegion',
            contentRegion: '@ui.contentRegion'
        },
        
        behaviors: {
            Tooltip: {
                behaviorClass: Tooltip
            }
        },
        
        playlists: null,
        signInManager: null,
        
        initialize: function () {
            this.playlists = Streamus.backgroundPage.Playlists;
            this.signInManager = Streamus.backgroundPage.SignInManager;

            this.listenTo(this.signInManager, 'change:signedIn', this._updateRegions);
            this.listenTo(this.playlists, 'change:active', this._onActivePlaylistChange);
        },
        
        onShow: function () {
            this._updateRegions();
        },
        
        _updateRegions: function () {
            if (this.signInManager.get('signedIn')) {
                this._showActivePlaylistContent();
            } else {
                this._showSignInContent();
            }
        },
        
        //  If the user is signed in -- show the user's active playlist items / information.
        _showActivePlaylistContent: function () {
            var activePlaylist = this.playlists.getActivePlaylist();

            this.contentRegion.show(new ActivePlaylistAreaView({
                model: activePlaylist,
                collection: activePlaylist.get('items')
            }));

            this.playlistTitleRegion.show(new PlaylistTitleView({
                model: activePlaylist
            }));
        },
        
        _showSignInContent: function() {
            //  Don't continously generate the signIn view if it's already visible because the view itself is trying to update its state
            //  and if you rip out the view while it's trying to update -- Marionette will throw errors saying elements don't have events/methods.
            if (!(this.contentRegion.currentView instanceof SignInView)) {
                //  Otherwise, allow the user to sign in by showing a sign in prompt.
                this.contentRegion.show(new SignInView({
                    model: this.signInManager
                }));

                this.playlistTitleRegion.empty();
            }
        },
        
        _onActivePlaylistChange: function(playlist, active) {
            //  Don't call updateRegions when a playlist is de-activated because don't want to redraw twice -- expensive!
            if (active) {
                this._updateRegions();
            }
        },
        
        _showSearch: function() {
            Streamus.channels.global.vent.trigger('showSearch', true);
        },
        
        _showPlaylistsArea: function() {
            Streamus.channels.global.vent.trigger('showPlaylistsArea');
        }
    });

    return LeftPaneView;
});