define([
    'common/enum/listItemType',
    'foreground/view/listItemButtonView',
    'text!template/playInStreamButton.html'
], function (ListItemType, ListItemButtonView, PlayInStreamButtonTemplate) {
    'use strict';

    var StreamItems = Streamus.backgroundPage.StreamItems;
    var Player = Streamus.backgroundPage.YouTubePlayer;

    var PlayInStreamButtonView = ListItemButtonView.extend({
        template: _.template(PlayInStreamButtonTemplate),
        
        attributes: {
            title: chrome.i18n.getMessage('play')
        },
        
        events: {
            'click': '_playInStream',
            'dblclick': '_playInStream'
        },
       
        //  Debounced to defend against accidental/spam clicking.
        _playInStream: _.debounce(function () {
            var songs = this._getSongs();
            
            //  TODO: A little more consistency here would be nice. What happens if playing 5 songs and 3 are in stream and 2 are not?
            if (songs.length === 1) {
                //  If there's only one song to be played - check if it's already in the stream.
                var song = songs[0];
                var streamItem = StreamItems.getBySong(song);
                _.isUndefined(streamItem) ? this._playSongs(song) : this._playStreamItem(streamItem);
            } else {
                this._playSongs(songs);
            }

            //  Don't allow dblclick to bubble up to the list item because that'll select it
            return false;
        }, 100, true),
        
        _getSongs: function () {
            var songs = [];
            var listItemType = this.model.get('listItemType');
            
            switch(listItemType) {
                case ListItemType.Playlist:
                    songs = this.model.get('items').pluck('song');
                    break;
                case ListItemType.PlaylistItem:
                case ListItemType.SearchResult:
                    songs.push(this.model.get('song'));
                    break;
                default:
                    throw new Error("Unhandled listItemType: " + listItemType);
            }

            return songs;
        },
        
        _playSongs: function (songs) {
            StreamItems.addSongs(songs, {
                playOnAdd: true
            });
        },
        
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