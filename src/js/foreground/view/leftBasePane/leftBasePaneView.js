define([
    'text!template/leftBasePane.html',
    'foreground/eventAggregator',
    'foreground/model/user',
    'foreground/collection/playlists',
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
            playlistTitle: '#playlist-title-region',
            content: '#content-region'
        },
        
        onShow: function () {
            this.updateRegions();
        },
        
        initialize: function () {
            this.listenTo(User, 'change:signedIn', this.updateRegions);
            this.listenTo(Playlists, 'change:active', this.updateRegions);
        },
        
        updateRegions: function () {

            if (User.get('signedIn')) {
                //  If the user is signed in -- show the user's active playlist items / information.
                var activePlaylist = Playlists.getActivePlaylist();

                this.content.show(new ActivePlaylistAreaView({
                    model: activePlaylist,
                    collection: activePlaylist.get('items')
                }));

                this.playlistTitle.show(new PlaylistTitleView({
                   model: activePlaylist                     
                }));
            } else {
                //  Otherwise, allow the user to sign in by showing a sign in prompt.
                this.content.show(new SignInView({
                    model: User
                }));

                this.playlistTitle.close();
            }

        }

    });

    return LeftBasePaneView;
});