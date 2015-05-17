define(function(require) {
    'use strict';

    var ListItemButton = require('foreground/view/behavior/listItemButton');
    var DeleteListItemButtonTemplate = require('text!template/listItemButton/deleteListItemButton.html');
    var DeleteIconTemplate = require('text!template/icon/deleteIcon_18.svg');

    var DeleteListItemButtonView = Marionette.ItemView.extend({
        template: _.template(DeleteListItemButtonTemplate),
        templateHelpers: {
            deleteIcon: _.template(DeleteIconTemplate)()
        },

        behaviors: {
            ListItemButton: {
                behaviorClass: ListItemButton
            }
        },

        attributes: {
            'data-tooltip-text': chrome.i18n.getMessage('delete')
        },

        initialize: function() {
            //  Ensure that the user isn't able to destroy the model more than once.
            this.doOnClickAction = _.once(this.doOnClickAction);
        },

        doOnClickAction: function() {
            this.model.destroy();
        }
    });

    return DeleteListItemButtonView;
});