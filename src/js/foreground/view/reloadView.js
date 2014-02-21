define([
    'text!template/reload.html'
], function (ReloadTemplate) {
    'use strict';

    var ReloadView = Backbone.Marionette.ItemView.extend({

        className: 'reload',

        template: _.template(ReloadTemplate),
        
        templateHelpers: {
            streamusIsTakingALongTimeToLoadReloadingMayHelpMessage: chrome.i18n.getMessage('streamusIsTakingALongTimeToLoadReloadingMayHelp')
        },
        
        doOk: function () {
            chrome.runtime.reload();
        }

    });

    return ReloadView;
});