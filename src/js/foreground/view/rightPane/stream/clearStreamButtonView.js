define([
    'foreground/view/genericForegroundView',
    'text!template/clearStreamButton.html',
    'foreground/collection/streamItems',
    'foreground/model/streamAction'
], function (GenericForegroundView, ClearStreamButtonTemplate, StreamItems, StreamAction) {
    'use strict';

    var ClearStreamButtonView = GenericForegroundView.extend({

        tagName: 'button',

        className: 'button-icon button-small clear',
                                
        template: _.template(ClearStreamButtonTemplate),

        attributes: {
            title: chrome.i18n.getMessage('clearStream')
        },
        
        events: {
            'click': 'clearStream',
        },

        render: function () {
            this.$el.html(this.template());
            return this;
        },
        
        clearStream: function () {
            StreamAction.clearStream();
        }
        
    });
    
    return ClearStreamButtonView;
});