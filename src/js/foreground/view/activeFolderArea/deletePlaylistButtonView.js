define([
    'foreground/view/genericForegroundView',
    'foreground/model/foregroundViewManager',
    'text!template/deletePlaylistButton.html',
    'foreground/collection/folders',
    'foreground/view/prompt/deletePlaylistPromptView'
], function (GenericForegroundView, ForegroundViewManager, DeletePlaylistButtonTemplate, Folders, DeletePlaylistPromptView) {
    'use strict';

    var DeletePlaylistButtonView = Backbone.Marionette.ItemView.extend({

        tagName: 'button',

        className: 'button-icon button-small delete',
                                
        template: _.template(DeletePlaylistButtonTemplate),

        enabledTitle: chrome.i18n.getMessage('deletePlaylist'),
        disabledTitle: chrome.i18n.getMessage('cantDeleteLastPlaylist'),
        
        events: {
            'click': 'showDeleteSelectedPlaylistPrompt'
        },

        onRender: function () {
            //  Can't delete the last playlist:
            var canDelete = Folders.getActiveFolder().get('playlists').canDelete();

            if (canDelete) {
                this.$el.attr('title', this.enabledTitle).removeClass('disabled');
            } else {
                this.$el.attr('title', this.disabledTitle).addClass('disabled');
            }

            return this;
        },
        
        initialize: function () {
            this.listenTo(Folders.getActiveFolder().get('playlists'), 'add remove reset', this.render);
            
            //  TODO: Don't do memory management like this -- use regions, I think!
            ForegroundViewManager.get('views').push(this);
        },

        showDeleteSelectedPlaylistPrompt: function () {
            var playlists = Folders.getActiveFolder().get('playlists');
            var canDelete = playlists.canDelete();

            if (canDelete) {
                var activePlaylist = playlists.getActivePlaylist();
                var isEmpty = activePlaylist.get('items').length === 0;
 
                //  No need to notify if the playlist is empty.
                if (isEmpty) {
                    activePlaylist.destroy();
                } else {
                    var deletePlaylistPromptView = new DeletePlaylistPromptView({
                        playlist: activePlaylist
                    });
                    
                    //  TODO: This doesn't highlight the fact that Settings controls whether it shows or not.
                    deletePlaylistPromptView.fadeInAndShow();
                }
            }

        }
        
    });
    
    return DeletePlaylistButtonView;
});