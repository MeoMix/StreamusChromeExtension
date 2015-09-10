import _ from 'common/shim/lodash.reference.shim';
import {LayoutView} from 'marionette';
import DialogContent from 'foreground/view/behavior/dialogContent';

var GoogleSignInView = LayoutView.extend({
  template: chrome.i18n.getMessage('googleSignInMessage'),

  behaviors: {
    DialogContent: {
      behaviorClass: DialogContent
    }
  }
});

export default GoogleSignInView;