import {LayoutView} from 'marionette';
import ClipboardRegion from 'background/view/clipboardRegion';
import backgroundAreaTemplate from 'template/backgroundArea.hbs!';

var BackgroundAreaView = LayoutView.extend({
  el: '#backgroundArea',
  template: backgroundAreaTemplate,

  regions: {
    clipboard: {
      el: 'clipboard',
      regionClass: ClipboardRegion
    }
  },

  initialize: function() {
    this.model.get('analyticsManager').sendPageView('/background.html');
  },

  onRender: function() {
    StreamusBG.channels.backgroundArea.vent.trigger('rendered');
  }
});

export default BackgroundAreaView;