'use strict';
import {LayoutView} from 'marionette';
import DialogContent from 'foreground/view/behavior/dialogContent';

var GoogleSignInView = LayoutView.extend({
  template: _.template(chrome.i18n.getMessage('googleSignInMessage')),

  behaviors: {
    DialogContent: {
      behaviorClass: DialogContent
    }
  }
});

export default GoogleSignInView;