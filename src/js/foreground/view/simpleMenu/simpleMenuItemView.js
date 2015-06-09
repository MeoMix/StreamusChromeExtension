define(function(require) {
  'use strict';

  var FixedPosition = require('foreground/enum/fixedPosition');
  var SimpleMenuItemTemplate = require('text!template/simpleMenu/simpleMenuItem.html');

  var SimpleMenuItemView = Marionette.LayoutView.extend({
    className: 'listItem listItem--small listItem--selectable listItem--clickable',
    template: _.template(SimpleMenuItemTemplate),

    events: {
      'click': '_onClick'
    },

    initialize: function() {
      this.$el.toggleClass('is-disabled', this.model.get('disabled'));
      this._setFixedPositionClass(this.model.get('fixedPosition'));
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
    },

    // Add a border dividing a fixed ItemView's position from the other collection of ItemViews.
    _setFixedPositionClass: function(fixedPosition) {
      if (fixedPosition === FixedPosition.Top) {
        this.$el.addClass('u-bordered--bottom');
      } else if(fixedPosition === FixedPosition.Bottom) {
        this.$el.addClass('u-bordered--top');
      }
    }
  });

  return SimpleMenuItemView;
});