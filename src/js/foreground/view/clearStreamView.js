define([
    'text!template/clearStream.html'
], function (ClearStreamTemplate) {
    'use strict';

    var StreamItems = Streamus.backgroundPage.StreamItems;
    var Settings = Streamus.backgroundPage.Settings;

    var ClearStreamView = Backbone.Marionette.ItemView.extend({
        className: 'clear-stream',
        template: _.template(ClearStreamTemplate),
        
        templateHelpers: {
            areYouSureYouWantToClearYourStreamMessage: chrome.i18n.getMessage('areYouSureYouWantToClearYourStream')
        },
        
        doOk: function() {
            StreamItems.clear();
        },

        _doRenderedOk: function (remindClearStream) {
            Settings.set('remindClearStream', remindClearStream);

            this.doOk();
        }
    });

    return ClearStreamView;
});