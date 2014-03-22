define([
    'background/collection/streamItems',
    'background/model/player',
    'text!template/playInStreamButton.html'
], function (StreamItems, Player, PlayInStreamButtonTemplate) {
    'use strict';

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
        
        playInStream: _.debounce(function () {

            var streamItem = StreamItems.getByVideo(this.model);

            if (_.isUndefined(streamItem)) {
                StreamItems.addByVideo(this.model, true);
            } else {
                if (streamItem.get('active')) {
                    Player.play();
                } else {
                    Player.playOnceVideoChanges();
                    streamItem.set('active', true);
                }
            }

            //  Don't allow dblclick to bubble up to the list item because that'll select it
            return false;
        }, 100, true)

    });

    return PlayInStreamButtonView;
});