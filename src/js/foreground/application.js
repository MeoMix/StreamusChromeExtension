import {Application} from 'marionette';
import Wreqr from 'backbone.wreqr';
import ForegroundAreaView from 'foreground/view/foregroundAreaView';

// TODO: File naming vs object name.
var ForegroundApplication = Application.extend({
  backgroundPage: null,
  backgroundChannels: null,

  channels: {
    global: Wreqr.radio.channel('global'),
    dialog: Wreqr.radio.channel('dialog'),
    notification: Wreqr.radio.channel('notification'),
    foreground: Wreqr.radio.channel('foreground'),
    foregroundArea: Wreqr.radio.channel('foregroundArea'),
    window: Wreqr.radio.channel('window'),
    playlistsArea: Wreqr.radio.channel('playlistsArea'),
    search: Wreqr.radio.channel('search'),
    element: Wreqr.radio.channel('element'),
    listItem: Wreqr.radio.channel('listItem'),
    simpleMenu: Wreqr.radio.channel('simpleMenu'),
    video: Wreqr.radio.channel('video'),
    playPauseButton: Wreqr.radio.channel('playPauseButton'),
    tooltip: Wreqr.radio.channel('tooltip'),
    scrollbar: Wreqr.radio.channel('scrollbar'),
    slider: Wreqr.radio.channel('slider')
  },

  initialize: function(options) {
    this.backgroundPage = options.backgroundProperties;
    this.backgroundChannels = options.backgroundChannels;
    this.on('start', this._onStart);
  },

  _onStart: function() {
    StreamusFG.backgroundChannels.foreground.vent.trigger('started');
    chrome.tabs.getCurrent(this._onChromeTabsGetCurrent.bind(this));
  },

  // Flag body with a class indicating whether view is in popup or tab so that CSS can react.
  _onChromeTabsGetCurrent: function(tab) {
    $('body').addClass(_.isUndefined(tab) ? 'is-popup' : 'is-tab');
    this._showForegroundArea();
  },

  _showForegroundArea: function() {
    var foregroundAreaView = new ForegroundAreaView({
      analyticsManager: StreamusFG.backgroundProperties.analyticsManager
    });
    foregroundAreaView.render();
  }
});

export default ForegroundApplication;