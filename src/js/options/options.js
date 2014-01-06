define([
    'common/view/settingsView'
], function (SettingsView) {
    'use strict';

    var OptionsView = Backbone.View.extend({
        el: $('body'),
        
        events: {
            'click button.save': 'save'
        },
        
        settingsView: new SettingsView(),
        
        initialize: function () {
            this.$el.find('button.save').before(this.settingsView.render().el);

            this.$el.find('button.save').text(chrome.i18n.getMessage('save'));
        },
        
        save: function() {
            this.settingsView.doOk();
        }
    });

    return new OptionsView();

});