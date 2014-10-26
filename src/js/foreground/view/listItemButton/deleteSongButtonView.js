define([
    'foreground/view/listItemButton/listItemButtonView',
    'text!template/listItemButton/deleteListItemButton.html'
], function (ListItemButtonView, DeleteListItemButtonTemplate) {
    'use strict';

    var DeleteSongButtonView = ListItemButtonView.extend({
        template: _.template(DeleteListItemButtonTemplate),
        
        attributes: {
            title: chrome.i18n.getMessage('delete')
        },
        
        initialize: function() {
            ListItemButtonView.prototype.initialize.apply(this, arguments);
        },
        
        doOnClickAction: function () {
            //  TODO: I am seeing an error, Uncaught Error: A "url" property or function must be specified, indicating that this is running multiple times.
            //  I have increased the debounce wait time to 250ms as the only way I can see this happening is if a person's PC is slow enough to not remove the view before
            //  the debounce interval has elapsed.
            this.model.destroy();
        }
    });

    return DeleteSongButtonView;
});