define([
    'foreground/view/genericForegroundView',
    'foreground/model/foregroundViewManager',
    'text!template/settings.html',
    'foreground/model/player',
    'foreground/model/settings'
], function (GenericForegroundView, ForegroundViewManager, SettingsTemplate, Player, Settings) {
    'use strict';

    var SettingsView = Backbone.Marionette.ItemView.extend({

        className: 'settings',

        template: _.template(SettingsTemplate),
        
        model: Settings,
        
        ui: {
            suggestedQualitySelect: '#suggestedQualitySelect',
            showTooltipsCheckbox: '#showTooltips',
            remindClearStreamCheckbox: '#remindClearStream',
            remindDeletePlaylistCheckbox: '#remindDeletePlaylist',
            alwaysOpenToSearchCheckbox: '#alwaysOpenToSearch'
        },

        templateHelpers: {
            'chrome.i18n': chrome.i18n
        },
        
        initialize: function() {
            ForegroundViewManager.get('views').push(this);
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