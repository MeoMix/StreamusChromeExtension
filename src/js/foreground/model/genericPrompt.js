define(function () {

    var GenericPrompt = Backbone.Model.extend({
        
        defaults: {
            title: '',
            okButtonText: chrome.i18n.getMessage('ok'),
            showCancelButton: true,
            showOkButton: true,
            view: null
        }

    });

    return GenericPrompt;
});