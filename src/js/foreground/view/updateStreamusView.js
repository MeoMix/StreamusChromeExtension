define([
    'text!template/updateStreamus.html'
], function (UpdateStreamusTemplate) {
    'use strict';
    
    var UpdateStreamusView = Backbone.Marionette.ItemView.extend({
        className: 'update-streamus',

        template: _.template(UpdateStreamusTemplate),
        
        templateHelpers: {
            anUpdateToStreamusIsAvailableMessage: chrome.i18n.getMessage('anUpdateToStreamusIsAvailable'),
            pleaseClickUpdateToRestartAndApplyTheUpdateMessage: chrome.i18n.getMessage('pleaseClickUpdateToRestartAndApplyTheUpdate')
        },
        
        doOk: function () {
            chrome.runtime.reload();
        }
    });

    return UpdateStreamusView;
});