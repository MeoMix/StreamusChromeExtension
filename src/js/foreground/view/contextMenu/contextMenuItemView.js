define(function(require) {
    'use strict';

    var Tooltip = require('foreground/view/behavior/tooltip');
    var ContextMenuItemTemplate = require('text!template/contextMenu/contextMenuItem.html');

    var ContextMenuItemView = Marionette.ItemView.extend({
        tagName: 'li',
        className: function() {
            var className = 'listItem listItem--small listItem--clickable js-tooltipable';
            className += this.model.get('disabled') ? ' is-disabled' : '';
            return className;
        },
        template: _.template(ContextMenuItemTemplate),

        events: {
            'click': '_onClick'
        },

        attributes: function() {
            return {
                title: this.model.get('title')
            };
        },

        behaviors: {
            Tooltip: {
                behaviorClass: Tooltip
            }
        },

        _onClick: function() {
            var enabled = !this.model.get('disabled');

            if (enabled) {
                this.model.get('onClick')();
            }

            //  Return false to prevent the view from closing which emulates how native, disabled contextMenu views work when clicked.
            return enabled;
        }
    });

    return ContextMenuItemView;
});