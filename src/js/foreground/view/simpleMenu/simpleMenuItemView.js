define(function(require) {
    'use strict';

    var Tooltipable = require('foreground/view/behavior/tooltipable');
    var MenuItemTemplate = require('text!template/simpleMenu/menuItem.html');

    var SimpleMenuItemView = Marionette.LayoutView.extend({
        className: function() {
            //  TODO: What is listItem--selectable getting us that --clickable is not?
            var className = 'listItem listItem--small listItem--selectable listItem--clickable';
            className += this.model.get('disabled') ? ' is-disabled' : '';
            return className;
        },
        template: _.template(MenuItemTemplate),

        attributes: function() {
            return {
                'data-ui': 'tooltipable',
                'data-tooltip-text': this.model.get('tooltipText')
            };
        },

        events: {
            'click': '_onClick'
        },

        behaviors: {
            Tooltipable: {
                behaviorClass: Tooltipable
            }
        },

        onRender: function() {
            this._setState(this.model.get('active'));
        },

        _onClick: function() {
            var enabled = !this.model.get('disabled');

            if (enabled) {
                //  TODO: I think I need to make a distinction between menu items which have click events and those which have values that need to be propagated.
                this.model.get('onClick')();

                this.model.set('active', true);
                this.triggerMethod('click:simpleMenuItem', {
                    view: this,
                    model: this.model
                });
            }

            //  Return false to prevent the view from closing which emulates how native, disabled contextMenu views work when clicked.
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