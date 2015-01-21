﻿define(function () {
    'use strict';
    
    var Dialog = Backbone.Model.extend({
        defaults: {
            title: '',
            submitButtonText: chrome.i18n.getMessage('ok'),
            cancelButtonText: chrome.i18n.getMessage('cancel'),
            showSubmitButton: true,
            showCancelButton: true,
            reminderProperty: '',
            reminderText: chrome.i18n.getMessage('remind'),
            alwaysSaveReminder: false
        },
        
        hasReminder: function() {
            return this.get('reminderProperty') !== '';
        }
    });

    return Dialog;
});