define(function(require) {
    'use strict';

    var ActivePlaylistAreaView = require('foreground/view/leftPane/activePlaylistAreaView');
    var SignInView = require('foreground/view/leftPane/signInView');
    var LeftPaneTemplate = require('text!template/leftPane/leftPane.html');

    var LeftPaneView = Marionette.LayoutView.extend({
        id: 'leftPane',
        className: 'leftPane flexColumn',
        template: _.template(LeftPaneTemplate),

        regions: {
            content: '[data-region=content]'
        },

        signInManager: null,

        initialize: function(options) {
            this.signInManager = options.signInManager;
            this.listenTo(this.signInManager, 'change:signedInUser', this._onSignInManagerChangeSignedInUser);

            var signedInUser = this.signInManager.get('signedInUser');
            if (!_.isNull(signedInUser)) {
                this.listenTo(signedInUser.get('playlists'), 'change:active', this._onPlaylistsChangeActive);
            }
        },

        onRender: function() {
            var signedInUser = this.signInManager.get('signedInUser');
            this._updateRegions(signedInUser);
        },

        _onSignInManagerChangeSignedInUser: function(model, signedInUser) {
            if (_.isNull(signedInUser)) {
                this.stopListening(model.previous('signedInUser').get('playlists'));
            } else {
                this.listenTo(signedInUser.get('playlists'), 'change:active', this._onPlaylistsChangeActive);
            }

            this._updateRegions(signedInUser);
        },

        _updateRegions: function(signedInUser) {
            if (_.isNull(signedInUser)) {
                this._showSignInContent();
            } else {
                var activePlaylist = signedInUser.get('playlists').getActivePlaylist();
                this._showActivePlaylistContent(activePlaylist);
            }
        },

        //  If the user is signed in -- show the user's active playlist items / information.
        _showActivePlaylistContent: function(activePlaylist) {
            this.showChildView('content', new ActivePlaylistAreaView({
                model: activePlaylist,
                collection: activePlaylist.get('items'),
                streamItems: Streamus.backgroundPage.stream.get('items')
            }));
        },

        _showSignInContent: function() {
            //  Don't continously generate the signIn view if it's already visible because the view itself is trying to update its state
            //  and if you rip out the view while it's trying to update -- Marionette will throw errors saying elements don't have events/methods.
            if (!(this.getChildView('content') instanceof SignInView)) {
                //  Otherwise, allow the user to sign in by showing a link to sign in.
                this.showChildView('content', new SignInView({
                    model: this.signInManager
                }));
            }
        },

        _onPlaylistsChangeActive: function(model, active) {
            //  Don't call updateRegions when a playlist is de-activated because don't want to redraw twice -- expensive!
            if (active) {
                this._updateRegions(this.signInManager.get('signedInUser'));
            }
        }
    });

    return LeftPaneView;
});