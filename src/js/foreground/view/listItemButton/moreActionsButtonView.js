define(function(require) {
    'use strict';

    var ListItemButton = require('foreground/view/behavior/listItemButton');
    var MoreActionsListItemButtonTemplate = require('text!template/listItemButton/moreActionsListItemButton.html');
    var MoreActionsIconTemplate = require('text!template/icon/moreActionsIcon_18.svg');

    var MoreActionsButtonView = Marionette.ItemView.extend({
        template: _.template(MoreActionsListItemButtonTemplate),
        templateHelpers: {
            moreActionsIcon: _.template(MoreActionsIconTemplate)()
        },

        attributes: {
            'data-tooltip-text': chrome.i18n.getMessage('moreActions')
        },

        behaviors: {
            ListItemButton: {
                behaviorClass: ListItemButton
            }
        },

        initialize: function() {
            // TODO: BAD
            this.$el.addClass('moreActions');
        },

        doOnClickAction: function() {

        }
    });

    return MoreActionsButtonView;
});