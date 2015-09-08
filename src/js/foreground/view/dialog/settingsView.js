import _ from 'common/shim/lodash.reference.shim';
import {LayoutView} from 'marionette';
import VideoQuality from 'common/enum/videoQuality';
import LayoutType from 'common/enum/layoutType';
import DesktopNotificationDurations from 'common/enum/desktopNotificationDuration';
import Checkboxes from 'foreground/collection/element/checkboxes';
import RadioGroups from 'foreground/collection/element/radioGroups';
import Switches from 'foreground/collection/element/switches';
import SimpleListItems from 'foreground/collection/element/simpleListItems';
import CheckboxView from 'foreground/view/element/checkboxView';
import RadioGroupView from 'foreground/view/element/radioGroupView';
import SimpleListItemView from 'foreground/view/element/simpleListItemView';
import SwitchView from 'foreground/view/element/switchView';
import DialogContent from 'foreground/view/behavior/dialogContent';
import {dialog_settings as SettingsTemplate} from 'common/templates';

var SettingsView = LayoutView.extend({
  id: 'settings',
  template: SettingsTemplate,

  templateHelpers: {
    generalMessage: chrome.i18n.getMessage('general'),
    videoQualityMessage: chrome.i18n.getMessage('videoQuality'),
    remindersMessage: chrome.i18n.getMessage('reminders'),
    desktopNotificationsMessage: chrome.i18n.getMessage('desktopNotifications'),
    contextMenusMessage: chrome.i18n.getMessage('contextMenus'),
    websiteEnhancementsMessage: chrome.i18n.getMessage('websiteEnhancements')
  },

  regions: {
    videoQuality: 'videoQuality',
    openInTab: 'openInTab',
    remindClearStream: 'remindClearStream',
    remindDeletePlaylist: 'remindDeletePlaylist',
    remindLinkAccount: 'remindLinkAccount',
    remindGoogleSignIn: 'remindGoogleSignIn',
    layoutType: 'layoutType',
    desktopNotificationsEnabled: 'desktopNotificationsEnabled',
    desktopNotificationDuration: 'desktopNotificationDuration',
    showTextSelectionContextMenu: 'showTextSelectionContextMenu',
    showYouTubeLinkContextMenu: 'showYouTubeLinkContextMenu',
    showYouTubePageContextMenu: 'showYouTubePageContextMenu',
    enhanceYouTube: 'enhanceYouTube',
    enhanceBeatport: 'enhanceBeatport'
  },

  behaviors: {
    DialogContent: {
      behaviorClass: DialogContent
    }
  },

  checkboxes: null,
  radioGroups: null,
  switches: null,
  simpleListItems: null,
  signInManager: null,

  initialize: function(options) {
    this.checkboxes = new Checkboxes();
    this.radioGroups = new RadioGroups();
    this.switches = new Switches();
    this.simpleListItems = new SimpleListItems();

    this.signInManager = options.signInManager;
  },

  onRender: function() {
    this._showSimpleListItem({
      propertyName: 'videoQuality',
      options: _.values(VideoQuality)
    });

    this._showSwitch('openInTab');
    this._showCheckbox('remindClearStream');
    this._showCheckbox('remindDeletePlaylist');

    // Once some states have been fulfilled there is no need to allow their reminders to be toggled because
    // the dialogs which correspond to the reminders will not be shown.
    if (this.signInManager.get('needLinkUserId')) {
      this._showCheckbox('remindLinkAccount');
    }

    if (this.signInManager.get('needGoogleSignIn')) {
      this._showCheckbox('remindGoogleSignIn');
    }

    this._showSwitch('desktopNotificationsEnabled', 'showNotifications');
    this._showSimpleListItem({
      propertyName: 'desktopNotificationDuration',
      labelKey: 'notificationDuration',
      options: _.values(DesktopNotificationDurations)
    });

    this._showSimpleListItem({
      propertyName: 'layoutType',
      labelKey: 'layoutType',
      options: _.values(LayoutType)
    });

    this._showCheckbox('showTextSelectionContextMenu', 'textSelection');
    this._showCheckbox('showYouTubeLinkContextMenu', 'youTubeLinks');
    this._showCheckbox('showYouTubePageContextMenu', 'youTubePages');
    this._showSwitch('enhanceYouTube', 'youTube');
    this._showSwitch('enhanceBeatport', 'beatport');
  },

  _showSimpleListItem: function(options) {
    var propertyName = options.propertyName;

    var simpleListItem = this.simpleListItems.add({
      property: options.propertyName,
      labelKey: _.isUndefined(options.labelKey) ? propertyName : options.labelKey,
      value: this.model.get(propertyName),
      options: options.options
    });

    this.showChildView(propertyName, new SimpleListItemView({
      model: simpleListItem
    }));
  },

  _showRadioGroup: function(propertyName, options) {
    var buttons = _.map(options, function(value, key) {
      return {
        checked: this.model.get(propertyName) === value,
        value: value,
        labelText: chrome.i18n.getMessage(key)
      };
    }, this);

    var radioGroup = this.radioGroups.add({
      property: propertyName,
      buttons: buttons
    });

    this.showChildView(propertyName, new RadioGroupView({
      model: radioGroup,
      collection: radioGroup.get('buttons')
    }));
  },

  _showCheckbox: function(propertyName, labelKey) {
    var checkbox = this.checkboxes.add({
      labelText: chrome.i18n.getMessage(_.isUndefined(labelKey) ? propertyName : labelKey),
      checked: this.model.get(propertyName),
      property: propertyName
    });

    this.showChildView(propertyName, new CheckboxView({
      model: checkbox
    }));
  },

  _showSwitch: function(propertyName, labelKey) {
    // switch is a reserved keyword so suffix with model.
    var switchModel = this.switches.add({
      labelText: chrome.i18n.getMessage(_.isUndefined(labelKey) ? propertyName : labelKey),
      checked: this.model.get(propertyName),
      property: propertyName
    });

    this.showChildView(propertyName, new SwitchView({
      model: switchModel
    }));
  },

  save: function() {
    var currentValues = {};

    this.checkboxes.each(function(checkbox) {
      currentValues[checkbox.get('property')] = checkbox.get('checked');
    });

    this.radioGroups.each(function(radioGroup) {
      currentValues[radioGroup.get('property')] = radioGroup.get('buttons').getChecked().get('value');
    });

    this.switches.each(function(switchModel) {
      currentValues[switchModel.get('property')] = switchModel.get('checked');
    });

    this.simpleListItems.each(function(simpleListItem) {
      currentValues[simpleListItem.get('property')] = simpleListItem.get('value');
    });

    this.model.save(currentValues);
  }
});

export default SettingsView;