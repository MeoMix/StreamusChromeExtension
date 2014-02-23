define([
    'text!template/deleteButton.html'
], function (DeleteButtonTemplate) {
    'use strict';

    var DeleteButtonView = Backbone.Marionette.ItemView.extend({
        
        tagName: 'button',
        className: 'button-icon',
        template: _.template(DeleteButtonTemplate),
        
        attributes: {
            title: chrome.i18n.getMessage('delete')
        },
        
        events: {
            'click': 'doDelete'
        },
        
        initialize: function () {
            this.applyTooltips();
        },
        
        doDelete: function () {
            //  qtip does this odd "fly out" when the view is removed -- destroy the active tooltip before the view to prevent.
            this.$el.qtip('api').destroy(true);
            this.model.destroy();

            //  Don't allow click to bubble up to the list item and cause a selection.
            return false;
        }

    });

    return DeleteButtonView;
});