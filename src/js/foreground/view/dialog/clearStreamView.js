import {LayoutView} from 'marionette';
import DialogContent from 'foreground/view/behavior/dialogContent';
import clearStreamTemplate from 'template/dialog/clearStream.hbs!';

var ClearStreamView = LayoutView.extend({
  template: clearStreamTemplate,
  behaviors: {
    DialogContent: {
      behaviorClass: DialogContent
    }
  }
});

export default ClearStreamView;