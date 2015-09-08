import _ from 'common/shim/lodash.reference.shim';
import {LayoutView} from 'marionette';
import DialogContent from 'foreground/view/behavior/dialogContent';
import AboutStreamusTemplate from 'template/dialog/aboutStreamus.html!text';

var AboutStreamusView = LayoutView.extend({
  id: 'aboutStreamus',
  template: _.template(AboutStreamusTemplate),

  templateHelpers: {
    applicationDetails: chrome.app.getDetails(),
    applicationDetailsMessage: chrome.i18n.getMessage('applicationDetails'),
    openHomepageMessage: chrome.i18n.getMessage('openHomepage'),
    versionMessage: chrome.i18n.getMessage('version'),
    openPatchNotesMessage: chrome.i18n.getMessage('openPatchNotes')
  },

  ui: {
    openHomepage: 'openHomepage',
    openPatchNotes: 'openPatchNotes'
  },

  events: {
    'click @ui.openHomepage': '_onClickOpenHomepage',
    'click @ui.openPatchNotes': '_onClickOpenPatchNotes'
  },

  behaviors: {
    DialogContent: {
      behaviorClass: DialogContent
    }
  },

  tabManager: null,

  initialize: function(options) {
    this.tabManager = options.tabManager;
  },

  _onClickOpenHomepage: function() {
    // jscs:disable requireCamelCaseOrUpperCaseIdentifiers
    var homepageUrl = chrome.app.getDetails().homepage_url;
    // jscs:enable requireCamelCaseOrUpperCaseIdentifiers
    this.tabManager.showWebsite(homepageUrl);
  },

  _onClickOpenPatchNotes: function() {
    this.tabManager.showWebsite('https://github.com/MeoMix/StreamusChromeExtension/releases');
  }
});

export default AboutStreamusView;