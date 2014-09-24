define([
    'text!template/clearStream.html'
], function (ClearStreamTemplate) {
    'use strict';

    var StreamItems = Streamus.backgroundPage.StreamItems;
    
    var ClearStreamView = Backbone.Marionette.ItemView.extend({
        template: _.template(ClearStreamTemplate),
        
        templateHelpers: {
            areYouSureYouWantToClearYourStreamMessage: chrome.i18n.getMessage('areYouSureYouWantToClearYourStream')
        },

        onSubmit: function () {
            StreamItems.clear();
        }
    });

    return ClearStreamView;
});