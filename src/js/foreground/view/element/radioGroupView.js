import {CompositeView} from 'marionette';
import RadioButtonView from 'foreground/view/element/radioButtonView';
import KeyCode from 'foreground/enum/keyCode';
import radioGroupTemplate from 'template/element/radioGroup.hbs!';

var RadioGroupView = CompositeView.extend({
  tagName: 'radio-group',
  template: radioGroupTemplate,
  childViewContainer: '@ui.buttons',
  childView: RadioButtonView,

  attributes: {
    tabIndex: 0
  },

  ui: {
    buttons: 'buttons'
  },

  events: {
    'keydown': '_onKeyDown'
  },

  _onKeyDown: function(event) {
    if (event.keyCode === KeyCode.ArrowLeft || event.keyCode === KeyCode.ArrowUp) {
      this.collection.checkPrevious();
    } else if (event.keyCode === KeyCode.ArrowRight || event.keyCode === KeyCode.ArrowDown) {
      this.collection.checkNext();
    }
  }
});

export default RadioGroupView;