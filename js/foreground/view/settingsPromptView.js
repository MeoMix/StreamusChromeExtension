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

        events: _.extend({}, GenericPromptView.prototype.events, {
        }),

        render: function () {
            GenericPromptView.prototype.render.call(this, arguments);

            this.remindClearStreamCheckbox = this.$el.find('#remindClearStream');

            var remindClearStream = Settings.get('remindClearStream');
            console.log("initializing:", remindClearStream);
            this.remindClearStreamCheckbox.prop('checked', remindClearStream);

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
            console.log("ClearStream?", remindClearStream);
            Settings.set('remindClearStream', remindClearStream);

            this.fadeOutAndHide();

        }

    });

    return SettingsPromptView;
});