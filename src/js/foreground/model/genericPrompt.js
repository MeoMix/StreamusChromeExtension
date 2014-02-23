define(function () {

    var GenericPrompt = Backbone.Model.extend({
        
        defaults: {
            title: '',
            okButtonText: chrome.i18n.getMessage('ok'),
            showCancelButton: true,
            view: null
        }

    });

    return GenericPrompt;
});