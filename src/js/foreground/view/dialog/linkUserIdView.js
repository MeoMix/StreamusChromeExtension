import {LayoutView} from 'marionette';
import DialogContent from 'foreground/view/behavior/dialogContent';
import linkUserIdTemplate from 'template/dialog/linkUserId.hbs!';

var LinkUserIdView = LayoutView.extend({
  template: linkUserIdTemplate,

  behaviors: {
    DialogContent: {
      behaviorClass: DialogContent
    }
  }
});

export default LinkUserIdView;