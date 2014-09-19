define([
    'text!template/updateStreamus.html'
], function (UpdateStreamusTemplate) {
    'use strict';
    
    var UpdateStreamusView = Backbone.Marionette.ItemView.extend({
        template: _.template(UpdateStreamusTemplate),
        
        templateHelpers: {
            anUpdateToStreamusIsAvailableMessage: chrome.i18n.getMessage('anUpdateToStreamusIsAvailable'),
            pleaseClickUpdateToReloadAndApplyTheUpdateMessage: chrome.i18n.getMessage('pleaseClickUpdateToReloadAndApplyTheUpdate')
        },
        
        _doRenderedOk: function () {
            chrome.runtime.reload();
        }
    });

    return UpdateStreamusView;
});