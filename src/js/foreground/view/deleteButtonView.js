define([
    'foreground/view/behavior/tooltip',
    'text!template/deleteButton.html'
], function (Tooltip, DeleteButtonTemplate) {
    'use strict';

    var DeleteButtonView = Backbone.Marionette.ItemView.extend({
        
        tagName: 'button',
        className: 'button-icon colored',
        template: _.template(DeleteButtonTemplate),
        
        attributes: {
            title: chrome.i18n.getMessage('delete')
        },
        
        events: {
            'click': 'doDelete'
        },
        
        behaviors: {
            Tooltip: {
                behaviorClass: Tooltip
            }
        },
        
        doDelete: function () {
            //  qTip will hang around when the view is removed because it can't find the element to remove itself.
            //  TODO: Marionette v2.0 should have an 'onBeforeDestroy' even which could be useful here. Not entirely sure yet.
            this.$el.qtip('destroy', true);
            this.model.destroy();
            
            //  Don't allow click to bubble up to the list item and cause a selection.
            return false;
        }

    });

    return DeleteButtonView;
});