'use strict';
import {LayoutView} from 'marionette';
import DialogContent from 'foreground/view/behavior/dialogContent';

var UpdateStreamusView = LayoutView.extend({
  template: _.template(chrome.i18n.getMessage('anUpdateIsAvailable')),

  behaviors: {
    DialogContent: {
      behaviorClass: DialogContent
    }
  }
});

export default UpdateStreamusView;