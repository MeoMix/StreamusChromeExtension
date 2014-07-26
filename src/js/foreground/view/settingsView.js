define([
    'text!template/settings.html'
], function (SettingsTemplate) {
    'use strict';

    var Player = chrome.extension.getBackgroundPage().YouTubePlayer;

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
            remindDeletePlaylistMessage: chrome.i18n.getMessage('remindDeletePlaylist'),
            remindLinkAccountMessage: chrome.i18n.getMessage('remindLinkAccount'),
            remindGoogleSignInMessage: chrome.i18n.getMessage('remindGoogleSignIn')
        },
        
        ui: {
            suggestedQualitySelect: '#suggested-quality',
            showTooltipsCheckbox: '#show-tooltips',
            remindClearStreamCheckbox: '#remind-clear-stream',
            remindDeletePlaylistCheckbox: '#remind-delete-playlist',
            remindLinkUserIdCheckbox: '#remind-link-user-id',
            remindGoogleSignInCheckbox: '#remind-google-sign-in',
            alwaysOpenToSearchCheckbox: '#always-open-to-search'
        },
        
        events: {
            'change @ui.suggestedQualitySelect': 'setSuggestedQuality',
            'change @ui.remindClearStreamCheckbox': 'setRemindClearStream',
            'change @ui.remindDeletePlaylistCheckbox': 'setRemindDeletePlaylist',
            'change @ui.showTooltipsCheckbox': 'setShowTooltips',
            'change @ui.alwaysOpenToSearchCheckbox': 'setAlwaysOpenToSearch',
            'change @ui.remindLinkUserIdCheckbox': 'setRemindLinkUserId',
            'change @ui.remindGoogleSignInCheckbox': 'setRemindGoogleSignIn'
        },
        
        setSuggestedQuality: function () {
            var suggestedQuality = this.ui.suggestedQualitySelect.val();
            this.model.set('suggestedQuality', suggestedQuality);
            Player.setSuggestedQuality(suggestedQuality);
        },
        
        setRemindClearStream: function() {
            var remindClearStream = this.ui.remindClearStreamCheckbox.is(':checked');
            this.model.set('remindClearStream', remindClearStream);
        },
        
        setRemindDeletePlaylist: function() {
            var remindDeletePlaylist = this.ui.remindDeletePlaylistCheckbox.is(':checked');
            this.model.set('remindDeletePlaylist', remindDeletePlaylist);
        },
        
        setRemindLinkUserId: function () {
            var remindLinkUserId = this.ui.remindLinkUserIdCheckbox.is(':checked');
            this.model.set('remindLinkUserId', remindLinkUserId);
        },
        
        setRemindGoogleSignIn: function() {
            var remindGoogleSignIn = this.ui.remindGoogleSignInCheckbox.is(':checked');
            this.model.set('remindGoogleSignIn', remindGoogleSignIn);
        },

        setShowTooltips: function() {
            var showTooltips = this.ui.showTooltipsCheckbox.is(':checked');
            this.model.set('showTooltips', showTooltips);
        },
        
        setAlwaysOpenToSearch: function() {
            var alwaysOpenToSearch = this.ui.alwaysOpenToSearchCheckbox.is(':checked');
            this.model.set('alwaysOpenToSearch', alwaysOpenToSearch);
        }
    });

    return SettingsView;
});