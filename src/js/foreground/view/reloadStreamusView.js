define([
    'text!template/reloadStreamus.html'
], function (ReloadStreamusTemplate) {
    'use strict';

    var ReloadStreamusView = Backbone.Marionette.ItemView.extend({

        className: 'reload-streamus',

        template: _.template(ReloadStreamusTemplate),
        
        templateHelpers: {
            streamusIsTakingALongTimeToLoadReloadingMayHelpMessage: chrome.i18n.getMessage('streamusIsTakingALongTimeToLoadReloadingMayHelp')
        },
        
        doOk: function () {
            chrome.runtime.reload();
        }

    });

    return ReloadStreamusView;
});