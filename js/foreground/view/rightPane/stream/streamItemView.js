define([
    'contextMenuGroups',
    'utility',
    'streamItems',
    'text!../template/streamItem.htm',
    'playPauseButton',
    'folders'
], function (ContextMenuGroups, Utility, StreamItems, StreamItemTemplate, PlayPauseButton, Folders) {
    'use strict';

    var StreamItemView = Backbone.View.extend({
        
        className: 'streamItem',

        template: _.template(StreamItemTemplate),

        events: {
            'contextmenu': 'showContextMenu',
            'click': 'select',
            'dblclick': 'togglePlayingState',
            'click .deleteButtonSvg': 'doDelete'
        },

        render: function () {
            this.$el.html(this.template(
                _.extend(this.model.toJSON(), {
                    //  Mix in chrome to reference internationalize.
                    'chrome.i18n': chrome.i18n
                })
            ));
            
            this.$el.toggleClass('selected', this.model.get('selected'));
            
            return this;
        },

        initialize: function () {
            this.listenTo(this.model, 'destroy', this.remove);
            this.listenTo(this.model, 'change:selected', this.toggleSelected);
        },

        select: function () {
            this.model.set('selected', true);
        },

        togglePlayingState: function () {
            PlayPauseButton.tryTogglePlayerState();
        },
        
        doDelete: function () {
            this.model.destroy();
        },
        
        //  Force the view to reflect the model's selected class. It's important to do this here, and not through render always, because
        //  render will cause the lazy-loaded image to be reset.
        toggleSelected: function () {
            this.$el.toggleClass('selected', this.model.get('selected'));
        },

        showContextMenu: function(event) {
            var self = this;

            event.preventDefault();

            ContextMenuGroups.reset();

            ContextMenuGroups.add({
                items: [{
                        text: chrome.i18n.getMessage("addToPlaylist"),
                        onClick: function () {
                            Folders.getActiveFolder().getActivePlaylist().addItem(self.model.get('video'));
                        }
                    }, {
                        text: chrome.i18n.getMessage("copyUrl"),
                        onClick: function () {

                            chrome.extension.sendMessage({
                                method: 'copy',
                                text: 'http://youtu.be/' + self.model.get('video').get('id')
                            });

                        }
                    }, {
                        text: chrome.i18n.getMessage("copyTitleAndUrl"),
                        onClick: function() {

                            chrome.extension.sendMessage({
                                method: 'copy',
                                text: '"' + self.model.get('title') + '" - http://youtu.be/' + self.model.get('video').get('id')
                            });

                        }
                    }, {
                        text: chrome.i18n.getMessage("delete"),
                        onClick: function () {
                            console.log("Removing model");
                            StreamItems.remove(self.model);
                        }
                    }, {
                        text: chrome.i18n.getMessage("banUntilStreamClear"),
                        disabled: StreamItems.getRelatedVideos().length < 5,
                        title: StreamItems.getRelatedVideos().length < 5 ? chrome.i18n.getMessage("cantBanNeedMoreVideos") : '',
                        onClick: function () {
                            StreamItems.ban(self.model);
                            self.model.destroy();
                        }
                    }]
            });

        }
    });

    return StreamItemView;
});