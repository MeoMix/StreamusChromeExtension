define([
    'text!template/linkUserId.html'
], function (LinkUserIdTemplate) {
    'use strict';

    var SignInManager = chrome.extension.getBackgroundPage().SignInManager;
    var Settings = chrome.extension.getBackgroundPage().Settings;
    
    var LinkUserIdView = Backbone.Marionette.ItemView.extend({
        className: 'link-user-id',
        template: _.template(LinkUserIdTemplate),

        templateHelpers: {
            linkAccountMessage: chrome.i18n.getMessage('linkAccountMessage'),
            dontRemindMeAgainMessage: chrome.i18n.getMessage('dontRemindMeAgain')
        },
        
        ui: {
            reminderCheckbox: '.reminder input[type="checkbox"]'
        },
        
        _doOnHide: function() {
            var remindLinkUserId = !this.ui.reminderCheckbox.is(':checked');
            Settings.set('remindLinkUserId', remindLinkUserId);
        },

        _doRenderedOk: function () {
            SignInManager.saveGooglePlusId();
            SignInManager.set('needPromptLinkUserId', false);
        }
    });

    return LinkUserIdView;
});