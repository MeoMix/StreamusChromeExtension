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
            songQualityMessage: chrome.i18n.getMessage('songQuality'),
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
            suggestedQualitySelect: '#suggested-quality',
            showTooltipsCheckbox: '#show-tooltips',
            remindClearStreamCheckbox: '#remind-clear-stream',
            remindDeletePlaylistCheckbox: '#remind-delete-playlist',
            alwaysOpenToSearchCheckbox: '#always-open-to-search'
        },
        
        events: {
            'change @ui.suggestedQualitySelect': 'setSuggestedQuality',
            'change @ui.remindClearStreamCheckbox': 'setRemindClearStream',
            'change @ui.remindDeletePlaylistCheckbox': 'setRemindDeletePlaylist',
            'change @ui.showTooltipsCheckbox': 'setShowTooltips',
            'change @ui.alwaysOpenToSearchCheckbox': 'setAlwaysOpenToSearch'
        },
        
        setSuggestedQuality: function () {
            var suggestedQuality = this.ui.suggestedQualitySelect.val();
            Settings.set('suggestedQuality', suggestedQuality);
            Player.setSuggestedQuality(suggestedQuality);
        },
        
        setRemindClearStream: function() {
            var remindClearStream = this.ui.remindClearStreamCheckbox.is(':checked');
            Settings.set('remindClearStream', remindClearStream);
        },
        
        setRemindDeletePlaylist: function() {
            var remindDeletePlaylist = this.ui.remindDeletePlaylistCheckbox.is(':checked');
            Settings.set('remindDeletePlaylist', remindDeletePlaylist);
        },
        
        setShowTooltips: function() {
            var showTooltips = this.ui.showTooltipsCheckbox.is(':checked');
            Settings.set('showTooltips', showTooltips);
        },
        
        setAlwaysOpenToSearch: function() {
            var alwaysOpenToSearch = this.ui.alwaysOpenToSearchCheckbox.is(':checked');
            Settings.set('alwaysOpenToSearch', alwaysOpenToSearch);
        }

    });

    return SettingsView;
});