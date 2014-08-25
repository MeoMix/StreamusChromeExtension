define([
    'text!template/settings.html'
], function (SettingsTemplate) {
    'use strict';

    var Player = Streamus.backgroundPage.YouTubePlayer;

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
            alwaysOpenInTabMessage: chrome.i18n.getMessage('alwaysOpenInTab'),
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
            alwaysOpenToSearchCheckbox: '#always-open-to-search',
            alwaysOpenInTabCheckbox: '#always-open-in-tab'
        },
        
        events: {
            'change @ui.suggestedQualitySelect': '_setSuggestedQuality',
            'change @ui.remindClearStreamCheckbox': '_setRemindClearStream',
            'change @ui.remindDeletePlaylistCheckbox': '_setRemindDeletePlaylist',
            'change @ui.showTooltipsCheckbox': '_setShowTooltips',
            'change @ui.alwaysOpenToSearchCheckbox': '_setAlwaysOpenToSearch',
            'change @ui.remindLinkUserIdCheckbox': '_setRemindLinkUserId',
            'change @ui.remindGoogleSignInCheckbox': '_setRemindGoogleSignIn',
            'change @ui.alwaysOpenInTabCheckbox': '_setAlwaysOpenInTab'
        },
        
        //  TODO: Refactor w/ enum so this doesn't grow indefinitely
        _setSuggestedQuality: function () {
            var suggestedQuality = this.ui.suggestedQualitySelect.val();
            this.model.set('suggestedQuality', suggestedQuality);
            Player.setSuggestedQuality(suggestedQuality);
        },
        
        _setRemindClearStream: function () {
            var remindClearStream = this.ui.remindClearStreamCheckbox.is(':checked');
            this.model.set('remindClearStream', remindClearStream);
        },
        
        _setRemindDeletePlaylist: function () {
            var remindDeletePlaylist = this.ui.remindDeletePlaylistCheckbox.is(':checked');
            this.model.set('remindDeletePlaylist', remindDeletePlaylist);
        },
        
        _setRemindLinkUserId: function () {
            var remindLinkUserId = this.ui.remindLinkUserIdCheckbox.is(':checked');
            this.model.set('remindLinkUserId', remindLinkUserId);
        },
        
        _setRemindGoogleSignIn: function () {
            var remindGoogleSignIn = this.ui.remindGoogleSignInCheckbox.is(':checked');
            this.model.set('remindGoogleSignIn', remindGoogleSignIn);
        },

        _setShowTooltips: function () {
            var showTooltips = this.ui.showTooltipsCheckbox.is(':checked');
            this.model.set('showTooltips', showTooltips);
        },
        
        _setAlwaysOpenToSearch: function () {
            var alwaysOpenToSearch = this.ui.alwaysOpenToSearchCheckbox.is(':checked');
            this.model.set('alwaysOpenToSearch', alwaysOpenToSearch);
        },
        
        _setAlwaysOpenInTab: function() {
            var alwaysOpenInTab = this.ui.alwaysOpenInTabCheckbox.is(':checked');
            this.model.set('alwaysOpenInTab', alwaysOpenInTab);
        }
    });

    return SettingsView;
});