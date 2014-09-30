define([
    'foreground/view/listItemButton/listItemButtonView',
    'text!template/listItemButton/playListItemButton.html'
], function (ListItemButtonView, PlayListItemButtonTemplate) {
    'use strict';

    var StreamItems = Streamus.backgroundPage.StreamItems;
    var Player = Streamus.backgroundPage.Player;

    var PlayInStreamButtonView = ListItemButtonView.extend({
        template: _.template(PlayListItemButtonTemplate),
        
        attributes: {
            title: chrome.i18n.getMessage('play')
        },
        
        doOnClickAction: function() {
            this._playSong();
        },

        _playSong: function () {
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
        },
        
        _playStreamItem: function (streamItem) {
            if (streamItem.get('active')) {
                Player.play();
            } else {
                Player.set('playOnActivate', true);
                streamItem.save({ active: true });
            }
        }
    });

    return PlayInStreamButtonView;
});