import {LayoutView} from 'marionette';
import DialogContent from 'foreground/view/behavior/dialogContent';
import googleSignInTemplate from 'template/dialog/googleSignIn.hbs!';

var GoogleSignInView = LayoutView.extend({
  template: googleSignInTemplate,

  behaviors: {
    DialogContent: {
      behaviorClass: DialogContent
    }
  }
});

export default GoogleSignInView;