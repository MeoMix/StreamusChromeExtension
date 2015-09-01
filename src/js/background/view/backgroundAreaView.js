'use strict';
import {LayoutView} from 'marionette';
import _ from 'lodash';
import ClipboardRegion from 'background/view/clipboardRegion';
import BackgroundAreaTemplate from 'template/backgroundArea.html!text';

var BackgroundAreaView = LayoutView.extend({
  el: '#backgroundArea',
  template: _.template(BackgroundAreaTemplate),

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