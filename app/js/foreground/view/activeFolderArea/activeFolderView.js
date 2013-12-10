//  This is the list of playlists on the playlists tab.
define([
    'text!../template/activeFolder.htm',
    'contextMenuGroups',
    'utility',
    'streamItems',
    'playlistView',
    'genericPromptView',
    'createPlaylistView',
], function (ActiveFolderTemplate, ContextMenuGroups, Utility, StreamItems, PlaylistView, GenericPromptView, CreatePlaylistView) {
    'use strict';

    var ActiveFolderView = Backbone.View.extend({
        
        tagName: 'ul',

        template: _.template(ActiveFolderTemplate),

        events: {
            'contextmenu': 'showContextMenu'
        },
        
        attributes: {
            'id': 'activeFolder'
        },
        
        //  Refreshes the playlist display with the current playlist information.
        render: function () {
            this.$el.html(this.template(this.model.toJSON()));

            var playlists = this.model.get('playlists');

            if (playlists.length > 0) {

                //  Build up the ul of li's representing each playlist.
                var listItems = playlists.map(function (playlist) {
                    var playlistView = new PlaylistView({
                        model: playlist
                    });

                    return playlistView.render().el;
                });

                //  Do this all in one DOM insertion to prevent lag in large folders.
                this.$el.append(listItems);
            }

            return this;
        },
        
        initialize: function () {
            this.listenTo(this.model.get('playlists'), 'add', this.addItem);
            Utility.scrollChildElements(this.el, 'span.playlitTitle');
            
            $(window).unload(function () {
                this.stopListening();
            }.bind(this));
        },

        addItem: function (playlist) {

            var playlistView = new PlaylistView({
                model: playlist
            });

            var element = playlistView.render().$el;

            if (this.$el.find('.playlist').length > 0) {

                var playlists = this.model.get('playlists');

                var currentPlaylistIndex = playlists.indexOf(playlist);

                var previousPlaylistId = playlists.at(currentPlaylistIndex - 1).get('id');

                var previousPlaylistElement = this.$el.find('.playlist[data-playlistid="' + previousPlaylistId + '"]');

                element.insertAfter(previousPlaylistElement);

            } else {
                element.appendTo(this.$el);
            }
        },
        
        showContextMenu: function(event) {

            //  Whenever a context menu is shown -- set preventDefault to true to let foreground know to not reset the context menu.
            event.preventDefault();

            if (event.target === event.currentTarget) {
                //  Didn't bubble up from a child -- clear groups.
                ContextMenuGroups.reset();
            }

            ContextMenuGroups.add({
                items: [{
                    text: chrome.i18n.getMessage('createPlaylist'),
                    onClick: function() {

                        var createPlaylistPromptView = new GenericPromptView({
                            title: chrome.i18n.getMessage('createPlaylist'),
                            okButtonText: chrome.i18n.getMessage('saveButtonText'),
                            model: new CreatePlaylistView()
                        });
                        
                        createPlaylistPromptView.fadeInAndShow();

                    }
                }]
            });
            
        }

    });

    return ActiveFolderView;
});