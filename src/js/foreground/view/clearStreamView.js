define([
    'text!template/clearStream.html'
], function (ClearStreamTemplate) {
    'use strict';

    var StreamItems = chrome.extension.getBackgroundPage().StreamItems;
    var Settings = chrome.extension.getBackgroundPage().Settings;

    var ClearStreamView = Backbone.Marionette.ItemView.extend({
        className: 'clear-stream',
        template: _.template(ClearStreamTemplate),
        
        templateHelpers: {
            areYouSureYouWantToClearYourStreamMessage: chrome.i18n.getMessage('areYouSureYouWantToClearYourStream'),
            dontRemindMeAgainMessage: chrome.i18n.getMessage('dontRemindMeAgain')
        },
        
        ui: {
            reminderCheckbox: '.reminder input[type="checkbox"]'
        },
        
        doOk: function() {
            StreamItems.clear();
        },

        _doRenderedOk: function () {           
            var remindClearStream = !this.ui.reminderCheckbox.is(':checked');
            Settings.set('remindClearStream', remindClearStream);

            this.doOk();
        }
    });

    return ClearStreamView;
});