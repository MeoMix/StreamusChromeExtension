define([
    'text!template/playInStreamButton.html',
    'background/collection/streamItems'
], function (PlayInStreamButtonTemplate, StreamItems) {
    'use strict';

    var PlayInStreamButtonView = Backbone.Marionette.ItemView.extend({
        
        tagName: 'button',
        className: 'button-icon',
        template: _.template(PlayInStreamButtonTemplate),
        
        attributes: {
            title: chrome.i18n.getMessage('play')
        },
        
        events: {
            'click': 'playInStream',
            'dblclick': 'playInStream'
        },
        
        initialize: function () {
            this.applyTooltips();
        },
        
        playInStream: _.debounce(function () {
            StreamItems.addByVideo(this.model, true);

            //  Don't allow dblclick to bubble up to the list item and cause a play.
            return false;
        }, 100, true)

    });

    return PlayInStreamButtonView;
});