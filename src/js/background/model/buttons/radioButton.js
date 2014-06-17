define(function () {
    'use strict';
    
    var RadioButton = Backbone.Model.extend({
        localStorage: new Backbone.LocalStorage('RadioButton'),
        
        defaults: {
            //  Need to set the ID for Backbone.LocalStorage
            id: 'RadioButton',
            enabled: false
        },
        
        initialize: function () {
            //  Load from Backbone.LocalStorage
            this.fetch();
        },
 
        toggleRadio: function () {
            this.save({
                enabled: !this.get('enabled')
            });
        }
    });

    //  Exposed globally so that the foreground can access the same instance through chrome.extension.getBackgroundPage()
    window.RadioButton = new RadioButton();
    return window.RadioButton;
});