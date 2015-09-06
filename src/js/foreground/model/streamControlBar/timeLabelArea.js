import {Model} from 'backbone';
import LocalStorage from 'lib/backbone.localStorage';

var TimeLabelArea = Model.extend({
  localStorage: new LocalStorage('TimeLabelArea'),

  defaults: {
    // Need to set the ID for Backbone.LocalStorage
    id: 'TimeLabelArea',
    showRemainingTime: false
  },

  initialize: function() {
    // Load from Backbone.LocalStorage
    this.fetch();
  },

  toggleShowRemainingTime: function() {
    var showRemainingTime = this.get('showRemainingTime');
    this.save('showRemainingTime', !showRemainingTime);
  }
});

export default TimeLabelArea;