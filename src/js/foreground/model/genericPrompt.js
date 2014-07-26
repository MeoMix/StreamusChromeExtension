define(function () {
    'use strict';
    
    var GenericPrompt = Backbone.Model.extend({
        defaults: {
            title: '',
            okButtonText: chrome.i18n.getMessage('ok'),
            showOkButton: true,
            view: null
        }
    });

    return GenericPrompt;
});