define(function () {
    'use strict';
    
    var Prompt = Backbone.Model.extend({
        defaults: {
            title: '',
            okButtonText: chrome.i18n.getMessage('ok'),
            cancelButtonText: chrome.i18n.getMessage('cancel'),
            showOkButton: true,
            showCancelButton: true,
            reminderProperty: false,
            reminderText: chrome.i18n.getMessage('dontRemindMe')
        }
    });

    return Prompt;
});