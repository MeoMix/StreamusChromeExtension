define(function(require) {
  'use strict';

  var Checkbox = require('foreground/model/element/checkbox');
  var CheckboxView = require('foreground/view/element/checkboxView');

  var ItemViewMultiSelect = Marionette.Behavior.extend({
    ui: {
      leftContent: '[data-ui~=leftContent]'
    },

    events: {
      'click @ui.leftContent': '_onClickLeftContent',
      'dblclick @ui.leftContent': '_onDblClickLeftContent',
      'mouseenter @ui.leftContent': '_onMouseEnterLeftContent',
      'mouseleave @ui.leftContent': '_onMouseLeaveLeftContent'
    },

    modelEvents: {
      'change:selected': '_onChangeSelected'
    },

    isMouseOver: false,
    checkbox: null,

    initialize: function() {
      this.checkbox = new Checkbox({
        // this.view.model can't be accessed in initialize from a behavior. https://github.com/marionettejs/backbone.marionette/issues/1579
        checked: this.view.options.model.get('selected')
      });
    },

    onRender: function() {
      this._setSelectedClass(this.view.model.get('selected'));
    },

    _onClickLeftContent: function(event) {
      this.view.trigger('click:leftContent', {
        shiftKey: event.shiftKey,
        model: this.view.model
      });
    },

    // Don't propagate dblClick event up to the list item because that will run an action on the item.
    _onDblClickLeftContent: function() {
      // Since returning false, need to announce the event happened here since root level won't know about it.
      Streamus.channels.element.vent.trigger('click', event);
      // Don't allow to bubble up since handling click at this level.
      return false;
    },

    _onMouseEnterLeftContent: function() {
      this.isMouseOver = true;

      if (!this.view.model.get('selected')) {
        this.ui.leftContent.addClass('is-showingCheckbox');
        this.ui.leftContent.removeClass('is-showingThumbnail');

        this.view.showChildView('checkbox', new CheckboxView({
          model: this.checkbox
        }));
      }
    },

    _onMouseLeaveLeftContent: function() {
      this.isMouseOver = false;

      if (!this.view.model.get('selected')) {
        this.ui.leftContent.removeClass('is-showingCheckbox');
        this.ui.leftContent.addClass('is-showingThumbnail');
        this.view.getRegion('checkbox').empty();
      }
    },

    _onChangeSelected: function(model, selected) {
      this._setSelectedClass(selected);
      this.checkbox.set('checked', selected);
    },

    _setSelectedClass: function(selected) {
      this.$el.toggleClass('is-selected', selected);

      if (!this.isMouseOver) {
        this.ui.leftContent.toggleClass('is-showingCheckbox', selected);
        this.ui.leftContent.toggleClass('is-showingThumbnail', !selected);

        if (selected) {
          this.view.showChildView('checkbox', new CheckboxView({
            model: this.checkbox
          }));
        }
      }
    }
  });

  return ItemViewMultiSelect;
});