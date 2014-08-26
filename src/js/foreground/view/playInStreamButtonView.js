define([
    'foreground/view/behavior/tooltip',
    'text!template/playInStreamButton.html'
], function (Tooltip, PlayInStreamButtonTemplate) {
    'use strict';

    var StreamItems = Streamus.backgroundPage.StreamItems;
    var Player = Streamus.backgroundPage.YouTubePlayer;

    var PlayInStreamButtonView = Backbone.Marionette.ItemView.extend({
        tagName: 'button',
        className: 'button-icon',
        template: _.template(PlayInStreamButtonTemplate),
        
        attributes: {
            title: chrome.i18n.getMessage('play')
        },
        
        events: {
            'click': '_playInStream',
            'dblclick': '_playInStream'
        },
        
        behaviors: {
            Tooltip: {
                behaviorClass: Tooltip
            }
        },
        
        _playInStream: _.debounce(function () {
            var song = this.model.get('song');
            var streamItem = StreamItems.getBySong(song);

            if (_.isUndefined(streamItem)) {
                StreamItems.addSongs(song, {
                    playOnAdd: true
                });
            } else {
                if (streamItem.get('active')) {
                    Player.play();
                } else {
                    Player.playOnceSongChanges();
                    streamItem.save({ active: true });
                }
            }

            //  Don't allow dblclick to bubble up to the list item because that'll select it
            return false;
        }, 100, true)
    });

    return PlayInStreamButtonView;
});