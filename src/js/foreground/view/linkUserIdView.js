define([
    'text!template/linkUserId.html'
], function (LinkUserIdTemplate) {
    'use strict';

    var SignInManager = Streamus.backgroundPage.SignInManager;

    var LinkUserIdView = Backbone.Marionette.ItemView.extend({
        template: _.template(LinkUserIdTemplate),

        templateHelpers: {
            linkAccountMessage: chrome.i18n.getMessage('linkAccountMessage')
        },

        onSubmit: function () {
            SignInManager.saveGooglePlusId();
            SignInManager.set('needPromptLinkUserId', false);
        }
    });

    return LinkUserIdView;
});