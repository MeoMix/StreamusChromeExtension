import {LayoutView} from 'marionette';
import {element_spinner as SpinnerTemplate} from 'common/templates';

var SpinnerView = LayoutView.extend({
  tagName: 'spinner',
  template: SpinnerTemplate
});

export default SpinnerView;