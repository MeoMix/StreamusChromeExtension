define([
    'text!../template/deletePlaylistButton.htm',
    'folders'
], function (DeletePlaylistButtonTemplate, Folders) {
    'use strict';

    var DeletePlaylistButtonView = Backbone.View.extend({

        tagName: 'button',

        className: 'button-label delete',
                                
        template: _.template(DeletePlaylistButtonTemplate),

        enabledTitle: chrome.i18n.getMessage('deletePlaylist'),
        disabledTitle: chrome.i18n.getMessage('deletePlaylistDisabled'),

        render: function () {
            this.$el.html(this.template());

            var disabled = Folders.getActiveFolder().get('playlists').length === 1;

            this.$el.prop('disabled', disabled);

            if (disabled) {
                this.$el.attr('title', this.disabledTitle);
            } else {
                this.$el.attr('title', this.enabledTitle);
            }

            return this;
        },
        
        initialize: function () {
            this.listenTo(Folders.getActiveFolder().get('playlists'), 'add addMultiple remove empty', this.render);
        }
        
    });
    
    return DeletePlaylistButtonView;
});