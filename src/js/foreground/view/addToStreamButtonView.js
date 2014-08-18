define([
    'foreground/view/behavior/tooltip',
    'text!template/addToStreamButton.html'
], function (Tooltip, AddToStreamButtonTemplate) {
    'use strict';

    var StreamItems = Streamus.backgroundPage.StreamItems;

    var AddToStreamButtonView = Backbone.Marionette.ItemView.extend({
        tagName: 'button',
        className: 'button-icon colored',
        template: _.template(AddToStreamButtonTemplate),
        
        attributes: {
            title: chrome.i18n.getMessage('add')
        },
        
        events: {
            'click': '_addToStream',
            'dblclick': '_addToStream'
        },
        
        behaviors: {
            Tooltip: {
                behaviorClass: Tooltip
            }
        },
        
        _addToStream: _.debounce(function () {
            StreamItems.addSongs(this.model.get('song'));

            //  Don't allow dblclick to bubble up to the list item and cause a play.
            return false;
        }, 100, true)
    });

    return AddToStreamButtonView;
});