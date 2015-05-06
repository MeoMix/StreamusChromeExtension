define(function(require) {
    'use strict';

    var ListItemButtonView = require('foreground/view/listItemButton/listItemButtonView');
    var ExtraActionsListItemButtonTemplate = require('text!template/listItemButton/extraActionsListItemButton.html');
    var ExtraActionsIconTemplate = require('text!template/icon/extraActionsIcon_18.svg');

    var ExtraActionsButtonView = ListItemButtonView.extend({
        template: _.template(ExtraActionsListItemButtonTemplate),
        templateHelpers: {
            extraActionsIcon: _.template(ExtraActionsIconTemplate)()
        },

        attributes: {
            //  TODO: i18n
            title: 'Extra actions' //chrome.i18n.getMessage('delete')
        },

        initialize: function() {
            ListItemButtonView.prototype.initialize.apply(this, arguments);
            // TODO: BAD
            this.$el.addClass('extraActions');
        },

        doOnClickAction: function() {

        }
    });

    return ExtraActionsButtonView;
});