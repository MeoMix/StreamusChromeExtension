define([
    'activeFolderView',
    'text!../template/activeFolderArea.htm',
    'settingsView',
    'genericPromptView',
    'createPlaylistView',
    'editPlaylistView',
    'deletePlaylistView',
    'deletePlaylistButtonView',
    'folders',
    'utility',
    'settings'
], function (ActiveFolderView, ActiveFolderAreaTemplate, SettingsView, GenericPromptView, CreatePlaylistView, EditPlaylistView, DeletePlaylistView, DeletePlaylistButtonView, Folders, Utility, Settings) {
    'use strict';

    var ActiveFolderAreaView = Backbone.View.extend({

        template: _.template(ActiveFolderAreaTemplate),

        activeFolderView: null,
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
            'click .edit': 'showEditSelectedPlaylistPrompt',
            'click .delete': 'showDeleteSelectedPlaylistPrompt'
        },
        
        render: function () {
            
            this.$el.html(this.template(
                _.extend(this.model.toJSON(), {
                    //  Mix in chrome to reference internationalize.
                    'chrome.i18n': chrome.i18n
                })
            ));

            this.$el.find('.list').append(this.activeFolderView.render().el);
            this.$el.find('.right-group').append(this.deletePlaylistButtonView.render().el);

            this.panel = this.$el.find('.panel');

            return this;
        },

        initialize: function() {

            this.activeFolderView = new ActiveFolderView({
                model: this.model.get('folder')
            });

            this.deletePlaylistButtonView = new DeletePlaylistButtonView();
            
            this.listenTo(this.model, 'destroy', this.hide);
            Utility.scrollChildElements(this.el, '.title');
        },
        
        show: function () {
            
            //  Store original values in data attribute to be able to revert without magic numbers.
            this.$el.data('background', this.$el.css('background')).transition({
                'background': 'rgba(0, 0, 0, 0.5)'
            }, 'snap');
            
            this.panel.data('left', this.panel.css('left')).transition({
                left: 0
            }, 'snap');
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
                left: this.panel.data('left')
            });
            
        },

        toggleActiveFolderVisibility: function(event) {

            var caretIcon = $(event.currentTarget).find('i');
            //  TODO: Would be nice to read from a model and not inspect the view.
            var isExpanded = caretIcon.hasClass('fa fa-caret-down');
            
            var activeFolderViewElement = this.activeFolderView.$el;

            if (isExpanded) {
                caretIcon.removeClass('fa fa-caret-down').addClass('fa fa-caret-right');

                var currentHeight = activeFolderViewElement.height();

                activeFolderViewElement.data('oldheight', currentHeight);

                //  Need to set height here because transition doesn't work if height is auto through CSS.
                activeFolderViewElement.height(currentHeight).transition({
                    height: 0
                }, 200, function () {
                    $(this).hide();
                });

            } else {
                caretIcon.addClass('fa fa-caret-down').removeClass('fa fa-caret-right');

                this.activeFolderView.$el.show().transition({
                    height: activeFolderViewElement.data('oldheight')
                }, 200);
            }

        },
        
        showSettingsPrompt: function () {
            
            var settingsPromptView = new GenericPromptView({
                title: chrome.i18n.getMessage('settings'),
                okButtonText: chrome.i18n.getMessage('saveButtonText'),
                model: new SettingsView
            });

            console.log("Created settings prompt:", settingsPromptView);

            settingsPromptView.fadeInAndShow();

        },
        
        showCreatePlaylistPrompt: function () {

            var createPlaylistPromptView = new GenericPromptView({
                title: chrome.i18n.getMessage('createPlaylist'),
                okButtonText: chrome.i18n.getMessage('saveButtonText'),
                model: new CreatePlaylistView
            });
            createPlaylistPromptView.fadeInAndShow();

        },
        
        showEditSelectedPlaylistPrompt: function () {

            var editPlaylistPromptView = new GenericPromptView({
                title: chrome.i18n.getMessage('editPlaylist'),
                okButtonText: chrome.i18n.getMessage('saveButtonText'),
                model: new EditPlaylistView({
                    model: Folders.getActiveFolder().get('playlists').getActivePlaylist()
                })
            });
            
            editPlaylistPromptView.fadeInAndShow();

        },
        
        showDeleteSelectedPlaylistPrompt: function () {

            var activePlaylist = Folders.getActiveFolder().get('playlists').getActivePlaylist();
            
            //  No need to notify if the playlist is empty.
            if (activePlaylist.get('items').length === 0) {
                activePlaylist.destroy();
            } else {
                
                var remindDeletePlaylist = Settings.get('remindDeletePlaylist');
                if (remindDeletePlaylist) {
                    
                    var deletePlaylistPromptView = new GenericPromptView({
                        title: chrome.i18n.getMessage('deletePlaylist'),
                        okButtonText: chrome.i18n.getMessage('deleteButtonText'),
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

    });

    return ActiveFolderAreaView;
});