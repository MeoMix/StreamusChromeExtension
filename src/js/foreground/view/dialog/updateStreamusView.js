import _ from 'common/shim/lodash.reference.shim';
import {LayoutView} from 'marionette';
import DialogContent from 'foreground/view/behavior/dialogContent';
import updateStreamusTemplate from 'template/dialog/updateStreamus.hbs!';

var UpdateStreamusView = LayoutView.extend({
  template: updateStreamusTemplate,

  behaviors: {
    DialogContent: {
      behaviorClass: DialogContent
    }
  }
});

export default UpdateStreamusView;