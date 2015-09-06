import {LayoutView} from 'marionette';
import DialogContent from 'foreground/view/behavior/dialogContent';

var ErrorView = LayoutView.extend({
  template: _.template('<%= text %>'),
  templateHelpers: function() {
    return {
      text: this.text
    };
  },

  behaviors: {
    DialogContent: {
      behaviorClass: DialogContent
    }
  },

  text: '',

  initialize: function(options) {
    this.text = options.text;
  }
});

export default ErrorView;