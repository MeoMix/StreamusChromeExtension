define([
    'foreground/view/genericForegroundView',
    'text!template/settings.htm',
    'foreground/model/player',
    'foreground/model/settings'
], function (GenericForegroundView, SettingsTemplate, Player, Settings) {
    'use strict';

    var SettingsView = GenericForegroundView.extend({
        
        className: 'settings',
    
        template: _.template(SettingsTemplate),
        
        suggestedQualitySelect: null,
        remindClearStreamCheckbox: null,
        remindDeletePlaylistCheckbox: null,

        render: function () {
            
            this.$el.html(this.template({
                'chrome.i18n': chrome.i18n
            }));
            
            this.remindClearStreamCheckbox = this.$el.find('#remindClearStream');
            this.remindDeletePlaylistCheckbox = this.$el.find('#remindDeletePlaylist');

            this.remindClearStreamCheckbox.prop('checked', Settings.get('remindClearStream'));
            this.remindDeletePlaylistCheckbox.prop('checked', Settings.get('remindDeletePlaylist'));

            this.suggestedQualitySelect = this.$el.find('#suggestedQualitySelect');
            //  Initialize to whatever's stored in localStorage.
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
        }

    });

    return SettingsView;
});