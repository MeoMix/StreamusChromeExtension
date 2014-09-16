define([
    'foreground/view/behavior/tooltip',
    'text!template/contextMenuItem.html'
], function (Tooltip, ContextMenuItemTemplate) {
    'use strict';

    var ContextMenuItemView = Backbone.Marionette.ItemView.extend({
        tagName: 'li',
        className: 'menu-item',
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

        onRender: function () {
            this._setState();
        },

        _setState: function () {
            this.$el.toggleClass('disabled', this.model.get('disabled'));
        },

        _onClick: function () {
            if (this.$el.hasClass('disabled')) {
                return false;
            }

            this.model.get('onClick')();
        }
    });

    return ContextMenuItemView;
});