define(function(require) {
    'use strict';

    var SimpleMenuItemTemplate = require('text!template/element/simpleMenuItem.html');

    var SimpleMenuItemView = Marionette.LayoutView.extend({
        className: 'listItem listItem--small listItem--selectable listItem--clickable',
        template: _.template(SimpleMenuItemTemplate),

        events: {
            'click': '_onClick'
        },

        onRender: function() {
            this._setState(this.model.get('active'));
        },

        _onClick: function() {
            this.model.set('active', true);
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