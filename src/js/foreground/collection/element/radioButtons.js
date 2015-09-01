'use strict';
import {Collection} from 'backbone';
import RadioButton from 'foreground/model/element/radioButton';

var RadioButtons = Collection.extend({
  model: RadioButton,

  initialize: function() {
    this.on('change:checked', this._onChangeChecked);
  },

  getChecked: function() {
    return this.findWhere({checked: true});
  },

  checkNext: function() {
    var nextIndex = this.indexOf(this.getChecked()) + 1;

    // Loop back around to the start of the list if exceeding the end.
    if (nextIndex === this.length) {
      nextIndex = 0;
    }

    this.at(nextIndex).set('checked', true);
  },

  checkPrevious: function() {
    var previousIndex = this.indexOf(this.getChecked()) - 1;

    // Loop back around to the end of the list if exceeding the start.
    if (previousIndex === -1) {
      previousIndex = this.length - 1;
    }

    this.at(previousIndex).set('checked', true);
  },

  _onChangeChecked: function(changedModel, checked) {
    if (checked) {
      // Ensure that only one radio button is checked at a time.
      var previouslyCheckedModel = this.find(function(model) {
        return model !== changedModel && model.get('checked');
      });

      previouslyCheckedModel.set('checked', false);
    }
  }
});
  
export default RadioButtons;