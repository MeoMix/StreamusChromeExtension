define(function () {
    'use strict';
    
    var Prompt = Backbone.Model.extend({
        defaults: {
            title: '',
            submitButtonText: chrome.i18n.getMessage('ok'),
            cancelButtonText: chrome.i18n.getMessage('cancel'),
            showSubmitButton: true,
            showCancelButton: true,
            reminderProperty: '',
            reminderText: chrome.i18n.getMessage('remind')
        },
        
        hasReminder: function() {
            return this.get('reminderProperty') !== '';
        }
    });

    return Prompt;
});