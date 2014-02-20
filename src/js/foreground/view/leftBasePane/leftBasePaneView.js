define([
    'text!template/leftBasePane.html',
    'foreground/eventAggregator',
    'foreground/model/user',
    'foreground/collection/playlists',
    'foreground/view/leftBasePane/activePlaylistAreaView',
    'foreground/view/leftBasePane/signInView'
], function (LeftBasePaneTemplate, EventAggregator, User, Playlists, ActivePlaylistAreaView, SignInView) {
    'use strict';

    var LeftBasePaneView = Backbone.Marionette.Layout.extend({
        
        id: 'leftBasePane',
        className: 'left-pane',
        template: _.template(LeftBasePaneTemplate),
        
        templateHelpers: function () {
            return {
                openMenuMessage: chrome.i18n.getMessage('openMenu'),
                showVideoSearchMessage: chrome.i18n.getMessage('showVideoSearch'),
                playlistTitle: User.get('signedIn') ? Playlists.getActivePlaylist().get('title') : ''
            };
        },

        ui: {
            playlistTitle: '.playlistTitle',
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
            content: '#content-region'
        },
        
        onRender: function () {
            this.showContent();
        },
        
        initialize: function () {
            this.listenTo(User, 'change:signedIn', this.showContent);
        },
        
        showContent: function() {

            var contentView;
            if (User.get('signedIn')) {
                console.log("A!!!");
                //  If the user is signed in -- show the user's active playlist items / information.
                var activePlaylist = Playlists.getActivePlaylist();

                console.log("activePlaylist", activePlaylist);

                contentView = new ActivePlaylistAreaView({
                    model: activePlaylist,
                    collection: activePlaylist.get('items')
                });

                console.log("contentView", contentView);
            } else {
                console.log("B!!!");
                //  Otherwise, allow the user to sign in by showing a sign in prompt.
                contentView = new SignInView({
                    model: User
                });
            }

            console.log("Showing:", contentView);

            this.content.show(contentView);
        }

    });

    return LeftBasePaneView;
});