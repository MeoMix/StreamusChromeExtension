define(function(require) {
    'use strict';

    var ListItemButtonView = require('foreground/view/listItemButton/listItemButtonView');
    var MoreActionsListItemButtonTemplate = require('text!template/listItemButton/moreActionsListItemButton.html');
    var MoreActionsIconTemplate = require('text!template/icon/moreActionsIcon_18.svg');

    var MoreActionsButtonView = ListItemButtonView.extend({
        template: _.template(MoreActionsListItemButtonTemplate),
        templateHelpers: {
            moreActionsIcon: _.template(MoreActionsIconTemplate)()
        },

        attributes: {
            title: chrome.i18n.getMessage('moreActions')
        },

        initialize: function() {
            ListItemButtonView.prototype.initialize.apply(this, arguments);
            // TODO: BAD
            this.$el.addClass('moreActions');
        },

        doOnClickAction: function() {

        }
    });

    return MoreActionsButtonView;
});