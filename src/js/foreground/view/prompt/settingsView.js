define([
    'common/enum/youTubeSuggestedQuality',
    'text!template/prompt/settings.html'
], function (YouTubeSuggestedQuality, SettingsTemplate) {
    'use strict';

    var SettingsView = Backbone.Marionette.ItemView.extend({
        id: 'settings',
        className: 'u-noWrap',
        template: _.template(SettingsTemplate),
        
        templateHelpers: {
            generalMessage: chrome.i18n.getMessage('general'),
            songQualityMessage: chrome.i18n.getMessage('songQuality'),
            highestMessage: chrome.i18n.getMessage('highest'),
            autoMessage: chrome.i18n.getMessage('auto'),
            lowestMessage: chrome.i18n.getMessage('lowest'),
            showTooltipsMessage: chrome.i18n.getMessage('showTooltips'),
            alwaysOpenToSearchMessage: chrome.i18n.getMessage('alwaysOpenToSearch'),
            alwaysOpenInTabMessage: chrome.i18n.getMessage('alwaysOpenInTab'),
            remindersMessage: chrome.i18n.getMessage('reminders'),
            remindClearStreamMessage: chrome.i18n.getMessage('remindClearStream'),
            remindDeletePlaylistMessage: chrome.i18n.getMessage('remindDeletePlaylist'),
            remindLinkAccountMessage: chrome.i18n.getMessage('remindLinkAccount'),
            remindGoogleSignInMessage: chrome.i18n.getMessage('remindGoogleSignIn'),
            YouTubeSuggestedQuality: YouTubeSuggestedQuality
        },
        
        ui: {
            checkboxes: 'input[type=checkbox]',
            selects: 'select'
        },
        
        events: {
            'change @ui.checkboxes': '_onChangeCheckbox',
            'input @ui.selects': '_onInputSelect'
        },
        
        _onChangeCheckbox: function (event) {
            var checkbox = $(event.target);
            var property = checkbox.data('property');
            var checked = checkbox.is(':checked');
            this._saveProperty(property, checked);
        },
        
        _onInputSelect: function (event) {
            var select = $(event.target);
            var property = select.data('property');
            var value = select.val();
            this._saveProperty(property, value);
        },
        
        _saveProperty: function(property, value) {
            this.model.save(property, value);
        }
    });

    return SettingsView;
});