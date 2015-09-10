import {LayoutView} from 'marionette';
import spinnerTemplate from 'template/element/spinner.hbs!';

var SpinnerView = LayoutView.extend({
  tagName: 'spinner',
  template: spinnerTemplate
});

export default SpinnerView;