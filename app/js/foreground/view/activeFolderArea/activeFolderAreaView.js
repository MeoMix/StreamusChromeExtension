define([
    'activeFolderView',
    'text!../template/activeFolderArea.htm',
    'settingsView',
    'genericPromptView',
    'createPlaylistView',
    'editPlaylistView',
    'deletePlaylistButtonView',
    'folders',
    'utility'
], function (ActiveFolderView, ActiveFolderAreaTemplate, SettingsView, GenericPromptView, CreatePlaylistView, EditPlaylistView, DeletePlaylistButtonView, Folders, Utility) {
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
            'click .edit': 'showEditSelectedPlaylistPrompt'
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

            this.$el.find('[title]:enabled').qtip({
                position: {
                    viewport: $(window)
                },
                style: {
                    classes: 'qtip-light qtip-shadow'
                }
            });

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

            var activeFolderViewElement = this.activeFolderView.$el;
            
            if (isExpanded) {

                var currentHeight = activeFolderViewElement.height();
     
                //  Need to set height here because transition doesn't work if height is auto through CSS.
                var heightStyle = $.trim(activeFolderViewElement[0].style.height);
                if (heightStyle === '' || heightStyle === 'auto') {
                    activeFolderViewElement.height(currentHeight);
                }

                activeFolderViewElement.data('oldheight', currentHeight);

                activeFolderViewElement.transitionStop().transition({
                    height: 0
                }, 200, function () {
                    $(this).hide();  
                });

            } else {

                this.activeFolderView.$el.show().transitionStop().transition({
                    height: activeFolderViewElement.data('oldheight')
                }, 200, function () {
                    caretIcon.data('expanded', true);
                });
            }

        },
        
        showSettingsPrompt: function () {
            
            var settingsPromptView = new GenericPromptView({
                title: chrome.i18n.getMessage('settings'),
                okButtonText: chrome.i18n.getMessage('saveButtonText'),
                model: new SettingsView()
            });

            settingsPromptView.fadeInAndShow();

        },
        
        showCreatePlaylistPrompt: function () {

            var createPlaylistPromptView = new GenericPromptView({
                title: chrome.i18n.getMessage('createPlaylist'),
                okButtonText: chrome.i18n.getMessage('saveButtonText'),
                model: new CreatePlaylistView()
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

        }

    });

    return ActiveFolderAreaView;
});