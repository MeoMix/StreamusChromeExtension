define([
    'text!template/linkUserId.html'
], function (LinkUserIdTemplate) {
    'use strict';

    var SignInManager = Streamus.backgroundPage.SignInManager;
    var Settings = Streamus.backgroundPage.Settings;
    
    var LinkUserIdView = Backbone.Marionette.ItemView.extend({
        className: 'link-user-id wrap-white-space',
        template: _.template(LinkUserIdTemplate),

        templateHelpers: {
            linkAccountMessage: chrome.i18n.getMessage('linkAccountMessage')
        },
        
        _doOnHide: function (remindLinkUserId) {
            Settings.set('remindLinkUserId', remindLinkUserId);
        },

        _doRenderedOk: function () {
            SignInManager.saveGooglePlusId();
            SignInManager.set('needPromptLinkUserId', false);
        }
    });

    return LinkUserIdView;
});