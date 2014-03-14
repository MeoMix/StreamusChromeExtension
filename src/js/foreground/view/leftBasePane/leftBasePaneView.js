define([
    'text!template/leftBasePane.html',
    'foreground/eventAggregator',
    'background/model/user',
    'background/collection/playlists',
    'foreground/view/leftBasePane/activePlaylistAreaView',
    'foreground/view/leftBasePane/playlistTitleView',
    'foreground/view/leftBasePane/signInView'
], function (LeftBasePaneTemplate, EventAggregator, User, Playlists, ActivePlaylistAreaView, PlaylistTitleView, SignInView) {
    'use strict';

    var LeftBasePaneView = Backbone.Marionette.Layout.extend({
        
        id: 'leftBasePane',
        className: 'left-pane',
        template: _.template(LeftBasePaneTemplate),
        
        templateHelpers: function () {
            return {
                openMenuMessage: chrome.i18n.getMessage('openMenu'),
                showVideoSearchMessage: chrome.i18n.getMessage('showVideoSearch')
            };
        },

        ui: {
            showVideoSearch: '.showVideoSearch',
            showPlaylistsArea: '.showPlaylistsArea'
        },
        
        events: {
            'click @ui.showVideoSearch': function () {
                EventAggregator.trigger('activePlaylistAreaView:showVideoSearch');
            },

            'click @ui.showPlaylistsArea': function () {
                EventAggregator.trigger('activePlaylistAreaView:showPlaylistsArea');
            }
        },

        regions: {
            playlistTitleRegion: '#playlist-title-region',
            contentRegion: '#content-region'
        },
        
        onShow: function () {
            this.updateRegions();
            this.applyTooltips();
        },
        
        initialize: function () {
            this.listenTo(User, 'change:signedIn', this.updateRegions);
            this.listenTo(Playlists, 'change:active', this.updateRegions);
        },
        
        updateRegions: function () {

            if (User.get('signedIn')) {
                //  If the user is signed in -- show the user's active playlist items / information.
                var activePlaylist = Playlists.getActivePlaylist();

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