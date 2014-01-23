//  TODO: Rename this options for easy finding??
define([
    'foreground/view/genericForegroundView',
    'text!template/settings.html',
    'foreground/model/player',
    'foreground/model/settings'
], function (GenericForegroundView, SettingsTemplate, Player, Settings) {
    'use strict';

    var SettingsView = GenericForegroundView.extend({

        className: 'settings',

        template: _.template(SettingsTemplate),

        suggestedQualitySelect: null,
        showTooltipsCheckbox: null,
        remindClearStreamCheckbox: null,
        remindDeletePlaylistCheckbox: null,

        render: function () {

            this.$el.html(this.template({
                'chrome.i18n': chrome.i18n
            }));

            this.showTooltipsCheckbox = this.$el.find('#showTooltips');
            this.remindClearStreamCheckbox = this.$el.find('#remindClearStream');
            this.remindDeletePlaylistCheckbox = this.$el.find('#remindDeletePlaylist');
            
            //  Initialize to whatever's stored in localStorage.
            console.log("Settings showTooltips:", Settings.get('showTooltips'));
            this.showTooltipsCheckbox.prop('checked', Settings.get('showTooltips'));
            this.remindClearStreamCheckbox.prop('checked', Settings.get('remindClearStream'));
            this.remindDeletePlaylistCheckbox.prop('checked', Settings.get('remindDeletePlaylist'));

            this.suggestedQualitySelect = this.$el.find('#suggestedQualitySelect');
            this.suggestedQualitySelect.val(Settings.get('suggestedQuality'));

            return this;
        },

        doOk: function () {

            var suggestedQuality = this.suggestedQualitySelect.val();

            Settings.set('suggestedQuality', suggestedQuality);
            Player.setSuggestedQuality(suggestedQuality);

            var remindClearStream = this.remindClearStreamCheckbox.is(':checked');
            Settings.set('remindClearStream', remindClearStream);

            var remindDeletePlaylist = this.remindDeletePlaylistCheckbox.is(':checked');
            Settings.set('remindDeletePlaylist', remindDeletePlaylist);

            var showTooltips = this.showTooltipsCheckbox.is(':checked');
            console.log("ShowTooltips?", showTooltips);
            Settings.set('showTooltips', showTooltips);
            
            //  TODO: Introduce a Tooltip Manager?
            $('[title]').qtip('disable', !showTooltips);
        }

    });

    return SettingsView;
});