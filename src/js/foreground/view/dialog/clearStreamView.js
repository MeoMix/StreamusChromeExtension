'use strict';
import {LayoutView} from 'marionette'
import DialogContent from 'foreground/view/behavior/dialogContent';

var ClearStreamView = LayoutView.extend({
  template: _.template(chrome.i18n.getMessage('clearStreamQuestion')),
  behaviors: {
    DialogContent: {
      behaviorClass: DialogContent
    }
  }
});

export default ClearStreamView;