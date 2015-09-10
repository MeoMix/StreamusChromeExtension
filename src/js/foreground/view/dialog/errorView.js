import _ from 'common/shim/lodash.reference.shim';
import {LayoutView} from 'marionette';
import DialogContent from 'foreground/view/behavior/dialogContent';
import errorTemplate from 'template/dialog/error.hbs!';

var ErrorView = LayoutView.extend({
  template: errorTemplate,
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