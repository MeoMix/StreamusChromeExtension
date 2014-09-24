define([
    'text!template/reloadStreamus.html'
], function (ReloadStreamusTemplate) {
    'use strict';

    var ReloadStreamusView = Backbone.Marionette.ItemView.extend({
        template: _.template(ReloadStreamusTemplate),
        
        templateHelpers: {
            streamusIsTakingALongTimeToLoadReloadingMayHelpMessage: chrome.i18n.getMessage('streamusIsTakingALongTimeToLoadReloadingMayHelp')
        },
        
        onSubmit: function () {
            chrome.runtime.reload();
        }
    });

    return ReloadStreamusView;
});