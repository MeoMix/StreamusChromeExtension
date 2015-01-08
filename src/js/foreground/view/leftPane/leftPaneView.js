define([
    'foreground/view/behavior/tooltip',
    'foreground/view/leftPane/activePlaylistAreaView',
    'foreground/view/leftPane/signInView',
    'text!template/leftPane/leftPane.html'
], function (Tooltip, ActivePlaylistAreaView, SignInView, LeftPaneTemplate) {
    'use strict';

    var LeftPaneView = Marionette.LayoutView.extend({
        id: 'leftPane',
        className: 'leftPane flexColumn',
        template: _.template(LeftPaneTemplate),

        regions: function () {
            return {
                contentRegion: '#' + this.id + '-contentRegion'
            };
        },

        signInManager: null,
        
        initialize: function () {
            this.signInManager = Streamus.backgroundPage.signInManager;
            this.listenTo(this.signInManager, 'change:signedInUser', this._onSignInManagerChangeSignedInUser);
            
            var signedInUser = this.signInManager.get('signedInUser');
            if (signedInUser !== null) {
                this.listenTo(signedInUser.get('playlists'), 'change:active', this._onPlaylistsChangeActive);
            }
        },
        
        onShow: function () {
            var signedInUser = this.signInManager.get('signedInUser');
            this._updateRegions(signedInUser);
        },
        
        _onSignInManagerChangeSignedInUser: function (model, signedInUser) {
            if (signedInUser === null) {
                this.stopListening(model.previous('signedInUser').get('playlists'));
            } else {
                this.listenTo(signedInUser.get('playlists'), 'change:active', this._onPlaylistsChangeActive);
            }
            
            this._updateRegions(signedInUser);
        },
        
        _updateRegions: function (signedInUser) {
            if (signedInUser !== null) {
                var activePlaylist = signedInUser.get('playlists').getActivePlaylist();
                this._showActivePlaylistContent(activePlaylist);
            } else {
                this._showSignInContent();
            }
        },
        
        //  If the user is signed in -- show the user's active playlist items / information.
        _showActivePlaylistContent: function (activePlaylist) {
            this.contentRegion.show(new ActivePlaylistAreaView({
                model: activePlaylist,
                collection: activePlaylist.get('items')
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
            }
        },
        
        _onPlaylistsChangeActive: function (model, active) {
            //  Don't call updateRegions when a playlist is de-activated because don't want to redraw twice -- expensive!
            if (active) {
                this._updateRegions(this.signInManager.get('signedInUser'));
            }
        }
    });

    return LeftPaneView;
});