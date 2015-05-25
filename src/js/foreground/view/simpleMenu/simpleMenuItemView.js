define(function(require) {
    'use strict';

    var SimpleMenuItemTemplate = require('text!template/simpleMenu/simpleMenuItem.html');

    var SimpleMenuItemView = Marionette.LayoutView.extend({
        className: 'listItem listItem--small listItem--selectable listItem--clickable',
        template: _.template(SimpleMenuItemTemplate),

        events: {
            'click': '_onClick'
        },

        initialize: function() {
            this.$el.toggleClass('is-disabled', this.model.get('disabled'));
            this.$el.toggleClass('u-bordered--top', this.model.get('fixed'));
        },

        onRender: function() {
            this._setState(this.model.get('active'));
        },

        _onClick: function() {
            var enabled = !this.model.get('disabled');

            if (enabled) {
                this.model.get('onClick').call(this.model, this.model);

                this.triggerMethod('click:item', {
                    view: this,
                    model: this.model
                });
            }

            // Return false to prevent the view from closing which emulates how native, disabled menu item views work when clicked.
            return enabled;
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