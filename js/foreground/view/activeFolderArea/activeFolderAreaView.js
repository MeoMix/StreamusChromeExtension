define([
    'activeFolderView',
    'text!../template/activeFolderArea.htm',
    'settingsPromptView',
    'createPlaylistPromptView',
    'editPlaylistPromptView',
    'deletePlaylistPromptView',
    'folders'
], function (ActiveFolderView, ActiveFolderAreaTemplate, SettingsPromptView, CreatePlaylistPromptView, EditPlaylistPromptView, DeletePlaylistPromptView, Folders) {
    'use strict';

    var ActiveFolderAreaView = Backbone.View.extend({

        template: _.template(ActiveFolderAreaTemplate),

        activeFolderView: null,

        attributes: {
            'id': 'activeFolderArea'
        },
        
        render: function () {
            
            this.$el.html(this.template(
                _.extend(this.model.toJSON(), {
                    //  Mix in chrome to reference internationalize.
                    'chrome.i18n': chrome.i18n
                })
            ));

            this.$el.find('.list').append(this.activeFolderView.render().el);

            return this;
        },
        
        events: {
            'click': 'hideIfClickOutsidePanel',
            'click .hide': 'destroyModel',
            'click h3': 'toggleActiveFolderVisibility',
            'click .settings': 'showSettingsPrompt',
            'click .add': 'showCreatePlaylistPrompt',
            'click .edit': 'showEditSelectedPlaylistPrompt',
            'click .delete': 'showDeleteSelectedPlaylistPrompt'
        },
        
        //playlistInputView: null,
        
        initialize: function() {

            //  TODO: Do I have to set this in initialize or can I do it through the property?
            this.activeFolderView = new ActiveFolderView({
                model: this.model.get('folder')
            });
            
            //this.playlistInputView = new PlaylistInputView({
            //    model: this.model
            //});

            //this.$el.prepend(this.playlistInputView.render().el);

            this.listenTo(this.model, 'destroy', this.hide);

        },
        
        show: function () {

            this.$el.show().transition({
                opacity: 1
            }, 200, function () {
                $(this).addClass('visible');
            });
            
        },
        
        destroyModel: function () {
            this.model.destroy();
        },
        
        //  If the user clicks the 'dark' area outside the panel -- hide the panel.
        hideIfClickOutsidePanel: function(event) {

            if (event.target == event.currentTarget) {
                this.model.destroy();
            }
        },
        
        hide: function() {
            var self = this;
            
            //  TODO: Should the fadeout time be the same as the fadein time?
            this.$el.removeClass('visible').transition({
                opacity: 0
            }, 400, function () {
                self.remove();
            });
            
        },

        toggleActiveFolderVisibility: function(event) {

            var caretIcon = $(event.currentTarget).find('i');
            //  TODO: Would be nice to read from a model and not inspect the view.
            var isExpanded = caretIcon.hasClass('icon-caret-down');
            
            var activeFolderViewElement = this.activeFolderView.$el;

            if (isExpanded) {
                caretIcon.removeClass('icon-caret-down').addClass('icon-caret-right');

                var currentHeight = activeFolderViewElement.height();

                activeFolderViewElement.data('oldheight', currentHeight);

                //  Need to set height here because transition doesn't work if height is auto through CSS.
                activeFolderViewElement.height(currentHeight).transition({
                    height: 0
                }, 200, function () {
                    $(this).hide();
                });

            } else {
                caretIcon.addClass('icon-caret-down').removeClass('icon-caret-right');

                this.activeFolderView.$el.show().transition({
                    height: activeFolderViewElement.data('oldheight')
                }, 200);
            }

        },
        
        showSettingsPrompt: function () {
            
            var settingsPromptView = new SettingsPromptView();
            settingsPromptView.fadeInAndShow();

        },
        
        showCreatePlaylistPrompt: function () {

            var createPlaylistPromptView = new CreatePlaylistPromptView();
            createPlaylistPromptView.fadeInAndShow();

        },
        
        showEditSelectedPlaylistPrompt: function () {

            var editPlaylistPromptView = new EditPlaylistPromptView({
                model: Folders.getActiveFolder().get('playlists').getActivePlaylist()
            });
            
            editPlaylistPromptView.fadeInAndShow();

        },
        
        showDeleteSelectedPlaylistPrompt: function () {

            var activePlaylist = Folders.getActiveFolder().get('playlists').getActivePlaylist();
            
            //  No need to notify if the playlist is empty.
            if (activePlaylist.get('items').length === 0) {
                activePlaylist.destroy();
            } else {

                var deletePlaylistPromptView = new DeletePlaylistPromptView({
                    model: activePlaylist
                });
                deletePlaylistPromptView.fadeInAndShow();
                
            }

        }

    });

    return ActiveFolderAreaView;
});