define([
    'text!../template/settingsPrompt.htm',
    'genericPromptView',
    'player',
    'settings'
], function (SettingsPromptTemplate, GenericPromptView, Player, Settings) {
    'use strict';

    var SettingsPromptView = GenericPromptView.extend({

        className: 'modalOverlay settingsPrompt prompt',

        template: _.template(SettingsPromptTemplate),

        panel: null,
        suggestedQualitySelect: null,

        events: {
            'click': 'hideIfClickOutsidePanel',
            'click .cancel': 'fadeOutAndHide',
            'click .ok': 'save'
        },

        render: function () {
            this.$el.html(this.template(
                _.extend({
                    //  Mix in chrome to reference internationalize.
                    'chrome.i18n': chrome.i18n
                })
            ));

            this.panel = this.$el.children('.panel');
            this.suggestedQualitySelect = this.panel.find('#suggestedQualitySelect');
            
            //  Initialize to whatever's stored in localStorage.
            this.suggestedQualitySelect.val(Settings.get('suggestedQuality'));

            return this;
        },
        
        save: function() {
         
            var suggestedQuality = this.suggestedQualitySelect.val();

            Settings.set('suggestedQuality', suggestedQuality);
            Player.setSuggestedQuality(suggestedQuality);

            this.fadeOutAndHide();

        }

    });

    return SettingsPromptView;
});