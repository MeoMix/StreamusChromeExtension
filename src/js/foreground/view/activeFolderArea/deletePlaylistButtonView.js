define([
    'foreground/view/genericForegroundView',
    'text!template/deletePlaylistButton.html',
    'foreground/collection/folders',
    'foreground/view/genericPromptView',
    'foreground/view/deletePlaylistView',
    'foreground/model/settings'
], function (GenericForegroundView, DeletePlaylistButtonTemplate, Folders, GenericPromptView, DeletePlaylistView, Settings) {
    'use strict';

    var DeletePlaylistButtonView = GenericForegroundView.extend({

        tagName: 'button',

        className: 'button-icon button-small delete',
                                
        template: _.template(DeletePlaylistButtonTemplate),

        enabledTitle: chrome.i18n.getMessage('deletePlaylist'),
        disabledTitle: chrome.i18n.getMessage('deletePlaylistDisabled'),
        
        events: {
            'click': 'showDeleteSelectedPlaylistPrompt'
        },

        render: function () {
            this.$el.html(this.template());

            var disabled = Folders.getActiveFolder().get('playlists').length === 1;

            this.$el.toggleClass('disabled', disabled);

            if (disabled) {
                this.$el.attr('title', this.disabledTitle);
            } else {
                this.$el.attr('title', this.enabledTitle);
            }

            return this;
        },
        
        initialize: function () {
            this.listenTo(Folders.getActiveFolder().get('playlists'), 'add addMultiple remove empty', this.render);
        },

        showDeleteSelectedPlaylistPrompt: function () {
            
            if (!this.$el.hasClass('disabled')) {

                var activePlaylist = Folders.getActiveFolder().get('playlists').getActivePlaylist();
 
                //  No need to notify if the playlist is empty.
                if (activePlaylist.get('items').length === 0) {
                    activePlaylist.destroy();
                } else {

                    var remindDeletePlaylist = Settings.get('remindDeletePlaylist');
                    if (remindDeletePlaylist) {

                        var deletePlaylistPromptView = new GenericPromptView({
                            title: chrome.i18n.getMessage('deletePlaylist'),
                            okButtonText: chrome.i18n.getMessage('delete'),
                            model: new DeletePlaylistView({
                                model: activePlaylist
                            })
                        });
                        deletePlaylistPromptView.fadeInAndShow();

                    } else {
                        activePlaylist.destroy();
                    }

                }

            }

        }
        
    });
    
    return DeletePlaylistButtonView;
});