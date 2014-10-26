define([
    'foreground/view/listItemButton/listItemButtonView',
    'text!template/listItemButton/playListItemButton.html'
], function (ListItemButtonView, PlayListItemButtonTemplate) {
    'use strict';

    var PlayInStreamButtonView = ListItemButtonView.extend({
        template: _.template(PlayListItemButtonTemplate),
        
        attributes: {
            title: chrome.i18n.getMessage('play')
        },
        
        streamItems: null,
        player: null,
        
        initialize: function() {
            this.streamItems = Streamus.backgroundPage.StreamItems;
            this.player = Streamus.backgroundPage.Player;
            
            ListItemButtonView.prototype.initialize.apply(this, arguments);
        },
        
        doOnClickAction: function() {
            this._playSong();
        },

        _playSong: function () {
            var song = this.model.get('song');
            
            //  If there's only one song to be played - check if it's already in the stream.
            var streamItem = this.streamItems.getBySong(song);
            
            if (_.isUndefined(streamItem)) {
                this.streamItems.addSongs(song, {
                    playOnAdd: true
                });
            } else {
                this._playStreamItem(streamItem);
            }
        },
        
        _playStreamItem: function (streamItem) {
            if (streamItem.get('active')) {
                //  TODO: It's weird that this doesn't turn to a pause once playing.
                this.player.play();
            } else {
                this.player.set('playOnActivate', true);
                streamItem.save({ active: true });
            }
        }
    });

    return PlayInStreamButtonView;
});