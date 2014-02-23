define([
    'text!template/settings.html',
    'background/model/player',
    'background/model/settings'
], function (SettingsTemplate, Player, Settings) {
    'use strict';

    var SettingsView = Backbone.Marionette.ItemView.extend({

        className: 'settings',
        template: _.template(SettingsTemplate),
        
        templateHelpers: {
            generalMessage: chrome.i18n.getMessage('general'),
            videoQualityMessage: chrome.i18n.getMessage('videoQuality'),
            highestMessage: chrome.i18n.getMessage('highest'),
            autoMessage: chrome.i18n.getMessage('auto'),
            lowestMessage: chrome.i18n.getMessage('lowest'),
            showTooltipsMessage: chrome.i18n.getMessage('showTooltips'),
            alwaysOpenToSearchMessage: chrome.i18n.getMessage('alwaysOpenToSearch'),
            remindersMessage: chrome.i18n.getMessage('reminders'),
            remindClearStreamMessage: chrome.i18n.getMessage('remindClearStream'),
            remindDeletePlaylistMessage: chrome.i18n.getMessage('remindDeletePlaylist')
        },
        
        model: Settings,
        
        ui: {
            suggestedQualitySelect: '#suggestedQualitySelect',
            showTooltipsCheckbox: '#showTooltips',
            remindClearStreamCheckbox: '#remindClearStream',
            remindDeletePlaylistCheckbox: '#remindDeletePlaylist',
            alwaysOpenToSearchCheckbox: '#alwaysOpenToSearch'
        },

        doOk: function () {
            var suggestedQuality = this.ui.suggestedQualitySelect.val();
            Settings.set('suggestedQuality', suggestedQuality);
            Player.setSuggestedQuality(suggestedQuality);

            var remindClearStream = this.ui.remindClearStreamCheckbox.is(':checked');
            Settings.set('remindClearStream', remindClearStream);

            var remindDeletePlaylist = this.ui.remindDeletePlaylistCheckbox.is(':checked');
            Settings.set('remindDeletePlaylist', remindDeletePlaylist);

            var showTooltips = this.ui.showTooltipsCheckbox.is(':checked');
            Settings.set('showTooltips', showTooltips);
            $('[title]').qtip('disable', !showTooltips);

            var alwaysOpenToSearch = this.ui.alwaysOpenToSearchCheckbox.is(':checked');
            Settings.set('alwaysOpenToSearch', alwaysOpenToSearch);
        }

    });

    return SettingsView;
});