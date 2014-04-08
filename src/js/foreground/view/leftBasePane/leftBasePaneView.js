define([
    'background/collection/playlists',
    'background/model/user',
    'foreground/eventAggregator',
    'foreground/view/leftBasePane/activePlaylistAreaView',
    'foreground/view/leftBasePane/playlistTitleView',
    'foreground/view/leftBasePane/signInView',
    'text!template/leftBasePane.html'
], function (Playlists, User, EventAggregator, ActivePlaylistAreaView, PlaylistTitleView, SignInView, LeftBasePaneTemplate) {
    'use strict';

    var LeftBasePaneView = Backbone.Marionette.Layout.extend({
        
        id: 'left-base-pane',
        className: 'left-pane',
        template: _.template(LeftBasePaneTemplate),
        
        templateHelpers: function () {
            return {
                openMenuMessage: chrome.i18n.getMessage('openMenu'),
                showSearchMessage: chrome.i18n.getMessage('showSearch')
            };
        },

        ui: {
            showSearch: '.show-search',
            showPlaylistsArea: '.show-playlists-area'
        },
        
        events: {
            'click @ui.showSearch': function () {
                EventAggregator.trigger('showSearch');
            },

            'click @ui.showPlaylistsArea': function () {
                EventAggregator.trigger('showPlaylistsArea');
            }
        },

        regions: {
            playlistTitleRegion: '#playlist-title-region',
            contentRegion: '#content-region'
        },
        
        onShow: function () {
            this.updateRegions();

            this.ui.showSearch.qtip();
            this.ui.showPlaylistsArea.qtip();
        },
        
        initialize: function () {
            this.listenTo(User, 'change:signedIn', this.updateRegions);
            this.listenTo(Playlists, 'change:active', function (playlist, active) {
                //  Don't call updateRegions when a playlist is de-activated because don't want to redraw twice -- expensive!
                if (active) {
                    this.updateRegions();
                }
            });
        },
        
        updateRegions: function () {

            if (User.get('signedIn')) {
                //  If the user is signed in -- show the user's active playlist items / information.
                var activePlaylist = Playlists.getActivePlaylist();
                console.log("Update regions is being called", activePlaylist.get('title'));
                this.contentRegion.show(new ActivePlaylistAreaView({
                    model: activePlaylist,
                    collection: activePlaylist.get('items')
                }));

                this.playlistTitleRegion.show(new PlaylistTitleView({
                   model: activePlaylist                     
                }));
            } else {

                //  Don't continously generate the signIn view if it's already visible because the view itself is trying to update its state
                //  and if you rip out the view while it's trying to update -- Marionette will throw errors saying elements don't have events/methods.
                if (!(this.contentRegion.currentView instanceof SignInView)) {
                    //  Otherwise, allow the user to sign in by showing a sign in prompt.
                    this.contentRegion.show(new SignInView({
                        model: User
                    }));

                    this.playlistTitleRegion.close();
                }

            }

        }

    });

    return LeftBasePaneView;
});