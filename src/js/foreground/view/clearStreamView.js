define([
    'text!template/clearStream.html'
], function (ClearStreamTemplate) {
    'use strict';

    var StreamItems = chrome.extension.getBackgroundPage().StreamItems;
    var Settings = chrome.extension.getBackgroundPage().Settings;

    var ClearStreamView = Backbone.Marionette.ItemView.extend({

        className: 'clear-stream',
        
        ui: {
            reminderCheckbox: '.reminder input[type="checkbox"]'
        },

        template: _.template(ClearStreamTemplate),
        
        templateHelpers: {
            areYouSureYouWantToClearYourStreamMessage: chrome.i18n.getMessage('areYouSureYouWantToClearYourStream'),
            dontRemindMeAgainMessage: chrome.i18n.getMessage('dontRemindMeAgain')
        },

        doOk: function () {           
            var remindClearStream = !this.ui.reminderCheckbox.is(':checked');
            Settings.set('remindClearStream', remindClearStream);

            StreamItems.clear();
        }
    });

    return ClearStreamView;
});