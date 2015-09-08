import _ from 'common/shim/lodash.reference.shim';
import {LayoutView} from 'marionette';
import DialogContent from 'foreground/view/behavior/dialogContent';

var LinkUserIdView = LayoutView.extend({
  template: _.template(chrome.i18n.getMessage('linkAccountsMessage')),

  behaviors: {
    DialogContent: {
      behaviorClass: DialogContent
    }
  }
});

export default LinkUserIdView;