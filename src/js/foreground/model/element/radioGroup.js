import {Collection, Model} from 'backbone';
import RadioButtons from 'foreground/collection/element/radioButtons';

var RadioGroup = Model.extend({
  defaults: {
    // Often times a radio group has a 1:1 relationship with a model property.
    // Linking that property to its radio group allows working with a collection of radio groups more easily.
    property: '',
    buttons: null
  },

  initialize: function() {
    this._ensureButtonsCollection();
  },

  _ensureButtonsCollection: function() {
    var buttons = this.get('buttons');

    // Need to convert buttons array to Backbone.Collection
    if (!(buttons instanceof Collection)) {
      // Silent because buttons is just being properly set.
      this.set('buttons', new RadioButtons(buttons, {
        silent: true
      }));
    }
  },

  getCheckedValue: function() {
    return this.get('buttons').getChecked().get('value');
  }
});

export default RadioGroup;