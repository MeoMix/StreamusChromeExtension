define(function(require) {
    'use strict';

    var SimpleMenuItemTemplate = require('text!template/simpleMenu/simpleMenuItem.html');

    var SimpleMenuItemView = Marionette.LayoutView.extend({
        className: function() {
            //  TODO: What is listItem--selectable getting us that --clickable is not?
            var className = 'listItem listItem--small listItem--selectable listItem--clickable';
            className += this.model.get('disabled') ? ' is-disabled' : '';
            className += this.model.get('fixed') ? ' u-bordered--top' : '';

            return className;
        },
        template: _.template(SimpleMenuItemTemplate),

        events: {
            'click': '_onClick'
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

            //  Return false to prevent the view from closing which emulates how native, disabled menu item views work when clicked.
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