define([
    'foreground/view/genericForegroundView',
    'text!template/playAllButton.html',
    'foreground/collection/streamItems'
], function (GenericForegroundView, PlayAllButtonTemplate, StreamItems) {
    'use strict';

    var PlayAllButtonView = GenericForegroundView.extend({

        tagName: 'button',

        className: 'button-label playAll',
                                
        template: _.template(PlayAllButtonTemplate),

        attributes: {
            title: chrome.i18n.getMessage('playAll')
        },
        
        events: {
            'click': 'addToStreamAndPlay'
        },

        render: function () {
            this.$el.html(this.template());
            return this;
        },
        
        addToStreamAndPlay: function () {
            StreamItems.addByPlaylistItems(this.model.get('items'), true);
        }
        
    });
    
    return PlayAllButtonView;
});