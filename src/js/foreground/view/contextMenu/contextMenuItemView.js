define([
    'foreground/view/behavior/tooltip',
    'text!template/contextMenu/contextMenuItem.html'
], function (Tooltip, ContextMenuItemTemplate) {
    'use strict';

    var ContextMenuItemView = Marionette.ItemView.extend({
        tagName: 'li',
        className: function () {
            var className = 'menu-item js-tooltipable';
            className += this.model.get('disabled') ? ' disabled' : '';
            return className;
        },
        template: _.template(ContextMenuItemTemplate),

        events: {
            'click': '_onClick',
        },

        attributes: function () {
            return {
                title: this.model.get('title')
            };
        },
        
        behaviors: {
            Tooltip: {
                behaviorClass: Tooltip
            }
        },

        _onClick: function () {
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