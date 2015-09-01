'use strict';
import {LayoutView} from 'marionette';
import CheckboxTemplate from 'template/element/checkbox.html!text';

var CheckboxView = LayoutView.extend({
  tagName: 'checkbox',
  className: function() {
    var className = this.model.get('primary') ? 'checkbox--primary' : 'checkbox--secondary';
    className += this.model.get('iconOnLeft') ? ' checkbox--leftIcon' : ' checkbox--rightIcon';
    return className;
  },
  template: _.template(CheckboxTemplate),

  ui: {
    icon: 'icon'
  },

  events: {
    'click': '_onClick',
    'webkitAnimationEnd @ui.icon': '_onIconWebkitAnimationEnd'
  },

  modelEvents: {
    'change:checked': '_onChangeChecked'
  },

  onRender: function() {
    var checked = this.model.get('checked');
    this._setCheckedState(checked);
  },

  _onIconWebkitAnimationEnd: function() {
    if (this.model.get('checking')) {
      this.$el.removeClass('is-checking');
      this.$el.addClass('is-checked');
    } else {
      this.$el.removeClass('is-unchecking');
      this.$el.addClass('is-unchecked');
    }

    this.model.set('checking', false);
  },

  _onClick: function() {
    this.model.set('checked', !this.model.get('checked'));
  },

  _onChangeChecked: function(model, checked) {
    this.model.set('checking', checked);

    if (checked) {
      this.$el.addClass('is-checking').removeClass('is-unchecked is-unchecking');
    } else {
      this.$el.addClass('is-unchecking').removeClass('is-checked is-checking');
    }
  },

  _setCheckedState: function(checked) {
    this.$el.toggleClass('is-checked', checked);
    this.$el.toggleClass('is-unchecked', !checked);
  }
});

export default CheckboxView;