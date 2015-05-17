define(function(require) {
    'use strict';

    var MenuItemTemplate = require('text!template/element/menuItem.html');

    var SimpleMenuItemView = Marionette.LayoutView.extend({
        className: 'listItem listItem--small listItem--selectable listItem--clickable',
        template: _.template(MenuItemTemplate),

        events: {
            'click': '_onClick'
        },

        onRender: function() {
            this._setState(this.model.get('active'));
        },

        _onClick: function() {
            this.model.set('active', true);
            this.triggerMethod('click:simpleMenuItem', {
                view: this,
                model: this.model
            });
        },

        _onChangeActive: function(model, active) {
            this._setState(active);
        },

        _setState: function(active) {
            this.$el.toggleClass('is-active', active);
        }
    });

    return SimpleMenuItemView;
});