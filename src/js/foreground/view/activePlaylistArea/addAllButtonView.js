define([
    'foreground/view/genericForegroundView',
    'text!template/addAllButton.html',
    'foreground/collection/streamItems'
], function (GenericForegroundView, AddAllButtonTemplate, StreamItems) {
    'use strict';

    var AddAllButtonView = GenericForegroundView.extend({

        tagName: 'button',

        className: 'button-label addAll',
                                
        template: _.template(AddAllButtonTemplate),

        attributes: {
            title: chrome.i18n.getMessage('enqueueAll')
        },
        
        events: {
            'click': 'addToStream'
        },

        render: function () {
            this.$el.html(this.template());
            return this;
        },
        
        addToStream: function () {
            StreamItems.addByPlaylist(this.model, false);
        }
        
    });
    
    return AddAllButtonView;
});