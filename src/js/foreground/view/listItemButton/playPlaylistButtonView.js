define([
    'foreground/view/listItemButton/listItemButtonView',
    'text!template/listItemButton/playListItemButton.html'
], function (ListItemButtonView, PlayListItemButtonTemplate) {
    'use strict';

    var StreamItems = Streamus.backgroundPage.StreamItems;

    var PlayPlaylistButtonView = ListItemButtonView.extend({
        template: _.template(PlayListItemButtonTemplate),

        initialize: function () {
            this.listenTo(this.model.get('items'), 'add remove reset', this._setDisabledState);
        },
        
        onRender: function() {
            this._setDisabledState();
        },
        
        doOnClickAction: function () {
            var songs = this.model.get('items').pluck('song');

            StreamItems.addSongs(songs, {
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