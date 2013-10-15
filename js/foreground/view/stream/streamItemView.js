define([
    'contextMenuGroups',
    'utility',
    'streamItems',
    'text!../template/streamItem.htm',
    'playPauseButton'
], function (ContextMenuGroups, Utility, StreamItems, StreamItemTemplate, PlayPauseButton) {
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
            this.$el.html(this.template(this.model.toJSON()));
            this.$el.toggleClass('selected', this.model.get('selected'));
            
            return this;
        },

        initialize: function (options) {
            if (options.parent === undefined) {
                console.trace();
                throw "StreamItemView should have a parent.";
            }

            this.parent = options.parent;

            var self = this;
            this.listenTo(this.model, 'destroy', function () {
                self.parent.sly.remove(this.render().el);
            });

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

            //  TODO: Maybe position should be inferred if not provided? Or maybe I say 'first', 'last' instead of 0, 1, 2.. etc
            ContextMenuGroups.add({
                position: 0,
                items: [{
                        position: 0,
                        text: chrome.i18n.getMessage("addToPlaylist"),
                        onClick: function () {
                            self.parent.model.getActivePlaylist().addItem(self.model.get('video'));
                        }
                    }, {
                        position: 1,
                        text: chrome.i18n.getMessage("copyUrl"),
                        onClick: function () {

                            chrome.extension.sendMessage({
                                method: 'copy',
                                text: 'http://youtu.be/' + self.model.get('video').get('id')
                            });

                        }
                    }, {
                        position: 2,
                        text: chrome.i18n.getMessage("copyTitleAndUrl"),
                        onClick: function() {

                            chrome.extension.sendMessage({
                                method: 'copy',
                                text: '"' + self.model.get('title') + '" - http://youtu.be/' + self.model.get('video').get('id')
                            });

                        }
                    }, {
                        position: 3,
                        text: chrome.i18n.getMessage("delete"),
                        onClick: function () {
                            self.model.destroy();
                        }
                    }, {
                        position: 4,
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