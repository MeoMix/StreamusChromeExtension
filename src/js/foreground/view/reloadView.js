define([
    'foreground/model/foregroundViewManager',
    'text!template/reload.html'
], function (ForegroundViewManager, ReloadTemplate) {
    'use strict';

    var ReloadView = Backbone.Marionette.ItemView.extend({

        className: 'reload',

        template: _.template(ReloadTemplate),
        
        templateHelpers: {
            streamusIsTakingALongTimeToLoadReloadingMayHelpMessage: chrome.i18n.getMessage('streamusIsTakingALongTimeToLoadReloadingMayHelp')
        },
        
        initialize: function () {
            ForegroundViewManager.subscribe(this);
        },
        
        doOk: function () {
            chrome.runtime.reload();
        }

    });

    return ReloadView;
});