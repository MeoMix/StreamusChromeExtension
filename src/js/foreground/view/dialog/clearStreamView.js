import _ from 'common/shim/lodash.reference.shim';
import {LayoutView} from 'marionette';
import DialogContent from 'foreground/view/behavior/dialogContent';

var ClearStreamView = LayoutView.extend({
  template: chrome.i18n.getMessage('clearStreamQuestion'),
  behaviors: {
    DialogContent: {
      behaviorClass: DialogContent
    }
  }
});

export default ClearStreamView;