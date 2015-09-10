import {LayoutView} from 'marionette';
import SpinnerTemplate from 'template/element/spinner.hbs!';

var SpinnerView = LayoutView.extend({
  tagName: 'spinner',
  template: SpinnerTemplate
});

export default SpinnerView;