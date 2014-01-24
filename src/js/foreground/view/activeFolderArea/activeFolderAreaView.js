define([
    'foreground/view/genericForegroundView',
    'foreground/view/activeFolderArea/playlistCollectionView',
    'text!template/activeFolderArea.html',
    'common/view/settingsView',
    'foreground/view/prompt/genericPromptView',
    'foreground/view/prompt/createPlaylistPromptView',
    'foreground/view/createPlaylistView',
    'foreground/view/prompt/editPlaylistPromptView',
    'foreground/view/activeFolderArea/deletePlaylistButtonView',
    'foreground/collection/folders'
], function (GenericForegroundView, PlaylistCollectionView, ActiveFolderAreaTemplate, SettingsView, GenericPromptView, CreatePlaylistPromptView, CreatePlaylistView, EditPlaylistPromptView, DeletePlaylistButtonView, Folders) {
    'use strict';

    var ActiveFolderAreaView = GenericForegroundView.extend({

        template: _.template(ActiveFolderAreaTemplate),

        playlistCollectionView: null,
        deletePlaylistButtonView: null,
        panel: null,
        
        attributes: {
            'id': 'activeFolderArea'
        },

        events: {
            'click': 'hideIfClickOutsidePanel',
            'click .hide': 'destroyModel',
            'click h3': 'toggleActiveFolderVisibility',
            'click .settings': 'showSettingsPrompt',
            'click .add': 'showCreatePlaylistPrompt',
            'click .edit': 'showEditSelectedPlaylistPrompt'
        },
        
        render: function () {
            
            this.$el.html(this.template(
                _.extend(this.model.toJSON(), {
                    //  Mix in chrome to reference internationalize.
                    'chrome.i18n': chrome.i18n
                })
            ));

            this.$el.find('.list').append(this.playlistCollectionView.render().el);
            this.$el.find('.right-group').append(this.deletePlaylistButtonView.render().el);

            this.panel = this.$el.find('.panel');
            this.initializeTooltips();

            return this;
        },

        initialize: function () {
            this.playlistCollectionView = new PlaylistCollectionView({
                collection: this.model.get('folder').get('playlists')
            });

            this.deletePlaylistButtonView = new DeletePlaylistButtonView();
            
            this.listenTo(this.model, 'destroy', this.hide);
        },
        
        show: function () {
            
            //  Store original values in data attribute to be able to revert without magic numbers.
            this.$el.data('background', this.$el.css('background')).transition({
                'background': 'rgba(0, 0, 0, 0.5)'
            }, 'snap');
            
            this.panel.transition({
                x: this.panel.width()
            }, 300, 'snap');

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
            
            this.$el.transition({
                'background': this.$el.data('background')
            }, function() {
                self.remove();
            });

            this.panel.transition({
                x: -20
            }, 300);
            
        },

        toggleActiveFolderVisibility: function(event) {

            var caretIcon = $(event.currentTarget).find('i');
            var isExpanded = caretIcon.data('expanded');

            if (isExpanded) {
                caretIcon.data('expanded', false);
            }

            caretIcon.transitionStop().transition({
                rotate: isExpanded ? -90 : 0
            }, 200);

            if (isExpanded) {
                this.playlistCollectionView.collapse();
            } else {
                this.playlistCollectionView.expand(function () {
                    caretIcon.data('expanded', true);
                });
            }

        },
        
        showSettingsPrompt: function () {
            
            var settingsPromptView = new GenericPromptView({
                title: chrome.i18n.getMessage('settings'),
                okButtonText: chrome.i18n.getMessage('save'),
                model: new SettingsView()
            });

            settingsPromptView.fadeInAndShow();

        },
        
        showCreatePlaylistPrompt: function () {
            var createPlaylistPromptView = new CreatePlaylistPromptView();
            createPlaylistPromptView.fadeInAndShow();
        },
        
        showEditSelectedPlaylistPrompt: function () {

            var activePlaylist = Folders.getActiveFolder().get('playlists').getActivePlaylist();

            var editPlaylistPromptView = new EditPlaylistPromptView({
                playlist: activePlaylist
            });
            
            editPlaylistPromptView.fadeInAndShow();

        }

    });

    return ActiveFolderAreaView;
});