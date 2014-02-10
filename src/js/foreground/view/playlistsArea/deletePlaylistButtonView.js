define([
    'foreground/view/genericForegroundView',
    'foreground/model/foregroundViewManager',
    'text!template/deletePlaylistButton.html',
    'foreground/collection/playlists',
    'foreground/view/prompt/deletePlaylistPromptView'
], function (GenericForegroundView, ForegroundViewManager, DeletePlaylistButtonTemplate, Playlists, DeletePlaylistPromptView) {
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
            var canDelete = Playlists.canDelete();

            if (canDelete) {
                this.$el.attr('title', this.enabledTitle).removeClass('disabled');
            } else {
                this.$el.attr('title', this.disabledTitle).addClass('disabled');
            }

            return this;
        },
        
        initialize: function () {
            this.listenTo(Playlists, 'add remove reset', this.render);
            ForegroundViewManager.subscribe(this);
        },

        showDeleteSelectedPlaylistPrompt: function () {
            var canDelete = Playlists.canDelete();

            if (canDelete) {
                var activePlaylist = Playlists.getActivePlaylist();
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