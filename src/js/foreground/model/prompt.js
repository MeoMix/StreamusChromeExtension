define(function () {
    'use strict';
    
    var Prompt = Backbone.Model.extend({
        defaults: {
            title: '',
            okButtonText: chrome.i18n.getMessage('ok'),
            showOkButton: true,
            reminderProperty: false,
            reminderText: chrome.i18n.getMessage('dontRemindMe'),
            view: null
        }
    });

    return Prompt;
});