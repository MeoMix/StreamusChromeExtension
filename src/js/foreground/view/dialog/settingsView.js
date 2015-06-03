define(function(require) {
  'use strict';

  var SongQuality = require('common/enum/songQuality');
  var DesktopNotificationDurations = require('common/enum/desktopNotificationDuration');
  var Checkboxes = require('foreground/collection/element/checkboxes');
  var RadioGroups = require('foreground/collection/element/radioGroups');
  var Switches = require('foreground/collection/element/switches');
  var SimpleListItems = require('foreground/collection/element/simpleListItems');
  var CheckboxView = require('foreground/view/element/checkboxView');
  var RadioGroupView = require('foreground/view/element/radioGroupView');
  var SimpleListItemView = require('foreground/view/element/simpleListItemView');
  var SwitchView = require('foreground/view/element/switchView');
  var DialogContent = require('foreground/view/behavior/dialogContent');
  var SettingsTemplate = require('text!template/dialog/settings.html');

  var SettingsView = Marionette.LayoutView.extend({
    id: 'settings',
    template: _.template(SettingsTemplate),

    templateHelpers: {
      generalMessage: chrome.i18n.getMessage('general'),
      songQualityMessage: chrome.i18n.getMessage('songQuality'),
      remindersMessage: chrome.i18n.getMessage('reminders'),
      desktopNotificationsMessage: chrome.i18n.getMessage('desktopNotifications')
    },

    regions: {
      songQuality: '[data-region=songQuality]',
      openToSearch: '[data-region=openToSearch]',
      openInTab: '[data-region=openInTab]',
      remindClearStream: '[data-region=remindClearStream]',
      remindDeletePlaylist: '[data-region=remindDeletePlaylist]',
      remindLinkAccount: '[data-region=remindLinkAccount]',
      remindGoogleSignIn: '[data-region=remindGoogleSignIn]',
      desktopNotificationsEnabled: '[data-region=desktopNotificationsEnabled]',
      desktopNotificationDuration: '[data-region=desktopNotificationDuration]'
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
        propertyName: 'songQuality',
        options: _.values(SongQuality)
      });

      this._showSwitch('openToSearch');
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

    _showCheckbox: function(propertyName) {
      var checkbox = this.checkboxes.add({
        labelText: chrome.i18n.getMessage(propertyName),
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

  return SettingsView;
});