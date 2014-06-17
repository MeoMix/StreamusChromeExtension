define([
    'foreground/view/behavior/tooltip',
    'text!template/playInStreamButton.html'
], function (Tooltip, PlayInStreamButtonTemplate) {
    'use strict';

    var StreamItems = chrome.extension.getBackgroundPage().StreamItems;
    var Player = chrome.extension.getBackgroundPage().YouTubePlayer;

    var PlayInStreamButtonView = Backbone.Marionette.ItemView.extend({
        tagName: 'button',
        className: 'button-icon colored',
        template: _.template(PlayInStreamButtonTemplate),
        
        attributes: {
            title: chrome.i18n.getMessage('play')
        },
        
        events: {
            'click': 'playInStream',
            'dblclick': 'playInStream'
        },
        
        behaviors: {
            Tooltip: {
                behaviorClass: Tooltip
            }
        },
        
        playInStream: _.debounce(function () {
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