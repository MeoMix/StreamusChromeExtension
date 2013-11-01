define([
    'text!../template/settingsPrompt.htm',
    'genericPromptView',
    'player',
    'settings'
], function (SettingsPromptTemplate, GenericPromptView, Player, Settings) {
    'use strict';

    var SettingsPromptView = GenericPromptView.extend({

        className: GenericPromptView.prototype.className + ' settingsPrompt',

        template: _.template(SettingsPromptTemplate),

        suggestedQualitySelect: null,
        remindClearStreamCheckbox: null,
        remindDeletePlaylistCheckbox: null,

        render: function () {
            GenericPromptView.prototype.render.call(this, arguments);

            this.remindClearStreamCheckbox = this.$el.find('#remindClearStream');
            this.remindDeletePlaylistCheckbox = this.$el.find('#remindDeletePlaylist');

            this.remindClearStreamCheckbox.prop('checked', Settings.get('remindClearStream'));
            this.remindDeletePlaylistCheckbox.prop('checked', Settings.get('remindDeletePlaylist'));

            this.suggestedQualitySelect = this.panel.find('#suggestedQualitySelect');
            //  Initialize to whatever's stored in localStorage.
            this.suggestedQualitySelect.val(Settings.get('suggestedQuality'));

            return this;
        },

        doOk: function() {
         
            var suggestedQuality = this.suggestedQualitySelect.val();

            Settings.set('suggestedQuality', suggestedQuality);
            Player.setSuggestedQuality(suggestedQuality);
            
            var remindClearStream = this.remindClearStreamCheckbox.is(':checked');
            Settings.set('remindClearStream', remindClearStream);

            var remindDeletePlaylist = this.remindDeletePlaylistCheckbox.is(':checked');
            Settings.set('remindDeletePlaylist', remindDeletePlaylist);

            this.fadeOutAndHide();

        }

    });

    return SettingsPromptView;
});