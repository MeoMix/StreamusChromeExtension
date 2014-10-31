define([
    'foreground/view/listItemButton/listItemButtonView',
    'text!template/listItemButton/playListItemButton.html'
], function (ListItemButtonView, PlayListItemButtonTemplate) {
    'use strict';

    var PlayPlaylistButtonView = ListItemButtonView.extend({
        template: _.template(PlayListItemButtonTemplate),
        
        streamItems: null,

        initialize: function () {
            this.streamItems = Streamus.backgroundPage.stream.get('items');
            this.listenTo(this.model.get('items'), 'add remove reset', this._setDisabledState);
            
            ListItemButtonView.prototype.initialize.apply(this, arguments);
        },
        
        onRender: function() {
            this._setDisabledState();
        },
        
        doOnClickAction: function () {
            var songs = this.model.get('items').pluck('song');

            this.streamItems.addSongs(songs, {
                playOnAdd: true
            });
        },
        
        _setDisabledState: function () {
            var empty = this.model.get('items').length === 0;
            this.$el.toggleClass('disabled', empty);

            var title = empty ? chrome.i18n.getMessage('playlistEmpty') : chrome.i18n.getMessage('play');
            this.$el.attr('title', title);
        }
    });

    return PlayPlaylistButtonView;
});