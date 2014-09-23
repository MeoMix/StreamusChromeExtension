define([
    'foreground/view/listItemButtonView',
    'text!template/playListItemButton.html'
], function (ListItemButtonView, PlayListItemButtonTemplate) {
    'use strict';

    var StreamItems = Streamus.backgroundPage.StreamItems;

    var PlayPlaylistButtonView = ListItemButtonView.extend({
        template: _.template(PlayListItemButtonTemplate),

        events: {
            'click': '_onClick',
            'dblclick': '_onClick'
        },
        
        initialize: function () {
            this.listenTo(this.model.get('items'), 'add remove reset', this._setTitleAndDisabledClass);
        },
        
        onRender: function() {
            this._setTitleAndDisabledClass();
        },
        
        _setTitleAndDisabledClass: function () {
            var empty = this.model.get('items').length === 0;
            this.$el.toggleClass('disabled', empty);

            var title = empty ? chrome.i18n.getMessage('playlistEmpty') : chrome.i18n.getMessage('play');
            this.$el.attr('title', title);
        },
        
        _onClick: function () {
            if (this.model.get('items').length > 0) {
                this._playSongs();
            }
            
            //  Don't allow event to bubble up because click event will cause it to be selected.
            return false;
        },
        
        //  Debounced to defend against accidental/spam clicking.
        _playSongs: _.debounce(function () {
            var songs = this.model.get('items').pluck('song');
            
            StreamItems.addSongs(songs, {
                playOnAdd: true
            });
        }, 100, true)
    });

    return PlayPlaylistButtonView;
});