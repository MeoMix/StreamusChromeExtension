import {LayoutView} from 'marionette';
import SpinnerTemplate from 'template/element/spinner.html!text';

var SpinnerView = LayoutView.extend({
  tagName: 'spinner',
  template: _.template(SpinnerTemplate)
});

export default SpinnerView;