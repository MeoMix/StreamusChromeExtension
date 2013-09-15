define([
    'settings',
    'player'
], function (Settings, Player) {
    'use strict';

    var suggestedQualitySelectView = Backbone.View.extend({
        el: $('#suggestedQualitySelect'),
        
        label: $('#suggestedQualitySelectLabel'),
        
        events: {
            'change': 'setSuggestedQuality'
        },
        
        initialize: function () {
            this.label.text(chrome.i18n.getMessage("suggestedQuality"));
            this.$el.find('option[value="highres"]').text(chrome.i18n.getMessage("highest"));
            this.$el.find('option[value="default"]').text(chrome.i18n.getMessage("auto"));
            this.$el.find('option[value="small"]').text(chrome.i18n.getMessage("lowest"));

            //  Initialize to whatever's stored in localStorage.
            this.$el.val(Settings.get('suggestedQuality'));
        },
        
        setSuggestedQuality: function () {
            
            //  Write user's choice to localStorage.
            var suggestedQuality = this.$el.val();

            Settings.set('suggestedQuality', suggestedQuality);
            Player.setSuggestedQuality(suggestedQuality);

        }
    });

    return new suggestedQualitySelectView;
});