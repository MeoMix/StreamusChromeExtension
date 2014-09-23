define([
    'foreground/view/listItemButtonView',
    'text!template/playListItemButton.html'
], function (ListItemButtonView, PlayListItemButtonTemplate) {
    'use strict';

    var StreamItems = Streamus.backgroundPage.StreamItems;
    var Player = Streamus.backgroundPage.YouTubePlayer;

    var PlayInStreamButtonView = ListItemButtonView.extend({
        template: _.template(PlayListItemButtonTemplate),
        
        attributes: {
            title: chrome.i18n.getMessage('play')
        },
        
        events: {
            'click': '_onClick',
            'dblclick': '_onClick'
        },
        
        _onClick: function() {
            this._playSong();
            
            //  Don't allow event to bubble up because click event will cause it to be selected.
            return false;
        },

        //  Debounced to defend against accidental/spam clicking.
        _playSong: _.debounce(function () {
            var song = this.model.get('song');
            
            //  If there's only one song to be played - check if it's already in the stream.
            var streamItem = StreamItems.getBySong(song);
            
            if (_.isUndefined(streamItem)) {
                StreamItems.addSongs(song, {
                    playOnAdd: true
                });
            } else {
                this._playStreamItem(streamItem);
            }
            
        }, 100, true),
        
        _playStreamItem: function (streamItem) {
            if (streamItem.get('active')) {
                Player.play();
            } else {
                Player.playOnceSongChanges();
                streamItem.save({ active: true });
            }
        }
    });

    return PlayInStreamButtonView;
});