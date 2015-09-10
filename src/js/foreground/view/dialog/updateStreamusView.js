import _ from 'common/shim/lodash.reference.shim';
import {LayoutView} from 'marionette';
import DialogContent from 'foreground/view/behavior/dialogContent';

var UpdateStreamusView = LayoutView.extend({
  template: chrome.i18n.getMessage('anUpdateIsAvailable'),

  behaviors: {
    DialogContent: {
      behaviorClass: DialogContent
    }
  }
});

export default UpdateStreamusView;