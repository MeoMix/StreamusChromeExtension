define([
    'text!template/clearStream.html',
    'background/model/settings',
    'background/collection/streamItems'
], function (ClearStreamTemplate, Settings, StreamItems) {
    'use strict';

    var ClearStreamView = Backbone.Marionette.ItemView.extend({

        className: 'clearStream',
        
        ui: {
            remindClearStreamCheckbox: 'input#remindClearStream'
        },

        template: _.template(ClearStreamTemplate),
        
        templateHelpers: {
            areYouSureYouWantToClearYourStreamMessage: chrome.i18n.getMessage('areYouSureYouWantToClearYourStream'),
            dontRemindMeAgainMessage: chrome.i18n.getMessage('dontRemindMeAgain')
        },

        doOk: function () {           
            var remindClearStream = !this.ui.remindClearStreamCheckbox.is(':checked');
            Settings.set('remindClearStream', remindClearStream);

            StreamItems.clear();
        }
    });

    return ClearStreamView;
});