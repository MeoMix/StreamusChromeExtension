define(function(require) {
    'use strict';

    var SongQuality = require('common/enum/songQuality');
    var DesktopNotificationDurations = require('common/enum/desktopNotificationDuration');
    var Checkboxes = require('foreground/collection/checkboxes');
    var RadioGroups = require('foreground/collection/radioGroups');
    var Switches = require('foreground/collection/switches');
    var SimpleListItems = require('foreground/collection/simpleListItems');
    var CheckboxView = require('foreground/view/element/checkboxView');
    var RadioGroupView = require('foreground/view/element/radioGroupView');
    var SimpleListItemView = require('foreground/view/element/simpleListItemView');
    var SwitchView = require('foreground/view/element/switchView');
    var DialogContentView = require('foreground/view/dialog/dialogContentView');
    var SettingsTemplate = require('text!template/dialog/settings.html');

    var SettingsView = DialogContentView.extend({
        id: 'settings',
        template: _.template(SettingsTemplate),

        templateHelpers: function() {
            return {
                viewId: this.id,
                generalMessage: chrome.i18n.getMessage('general'),
                songQualityMessage: chrome.i18n.getMessage('songQuality'),
                remindersMessage: chrome.i18n.getMessage('reminders'),
                desktopNotificationsMessage: chrome.i18n.getMessage('desktopNotifications')
            };
        },

        regions: function() {
            return {
                songQualityRegion: '#' + this.id + '-songQualityRegion',
                openToSearchRegion: '#' + this.id + '-openToSearchRegion',
                openInTabRegion: '#' + this.id + '-openInTabRegion',
                remindClearStreamRegion: '#' + this.id + '-remindClearStreamRegion',
                remindDeletePlaylistRegion: '#' + this.id + '-remindDeletePlaylistRegion',
                remindLinkAccountRegion: '#' + this.id + '-remindLinkAccountRegion',
                remindGoogleSignInRegion: '#' + this.id + '-remindGoogleSignInRegion',
                desktopNotificationsEnabledRegion: '#' + this.id + '-desktopNotificationsEnabledRegion',
                desktopNotificationDurationRegion: '#' + this.id + '-desktopNotificationDurationRegion'
            };
        },

        checkboxes: null,
        radioGroups: null,
        switches: null,
        simpleListItems: null,
        signInManager: null,

        initialize: function() {
            this.checkboxes = new Checkboxes();
            this.radioGroups = new RadioGroups();
            this.switches = new Switches();
            this.simpleListItems = new SimpleListItems();

            this.signInManager = Streamus.backgroundPage.signInManager;
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

            //  Once some states have been fulfilled there is no need to allow their reminders to be toggled because
            //  the dialogs which correspond to the reminders will not be shown.
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

            this[propertyName + 'Region'].show(new SimpleListItemView({
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

            this[propertyName + 'Region'].show(new RadioGroupView({
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

            this[propertyName + 'Region'].show(new CheckboxView({
                model: checkbox
            }));
        },

        _showSwitch: function(propertyName, labelKey) {
            //  switch is a reserved keyword so suffix with model.
            var switchModel = this.switches.add({
                labelText: chrome.i18n.getMessage(_.isUndefined(labelKey) ? propertyName : labelKey),
                checked: this.model.get(propertyName),
                property: propertyName
            });

            this[propertyName + 'Region'].show(new SwitchView({
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