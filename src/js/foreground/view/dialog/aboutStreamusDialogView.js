import Dialog from 'foreground/model/dialog/dialog';
import AboutStreamusView from 'foreground/view/dialog/aboutStreamusView';
import DialogView from 'foreground/view/dialog/dialogView';

var AboutStreamusDialogView = DialogView.extend({
  id: 'aboutStreamusDialog',

  initialize: function() {
    this.model = new Dialog();

    this.contentView = new AboutStreamusView({
      tabManager: StreamusFG.backgroundProperties.tabManager
    });

    DialogView.prototype.initialize.apply(this, arguments);
  }
});

export default AboutStreamusDialogView;