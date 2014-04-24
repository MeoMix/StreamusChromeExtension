define([
    'foreground/model/genericPrompt',
    'foreground/model/notification',
    'foreground/view/notificationView',
    'foreground/view/prompt/genericPromptView'
], function (GenericPrompt, Notification, NotificationView, GenericPromptView) {
    'use strict';
    
    var NotificationPromptView = GenericPromptView.extend({
        model: null,
        
        initialize: function (options) {

            this.model = new GenericPrompt({
                title: chrome.i18n.getMessage('errorEncountered'),
                view: new NotificationView({
                    model: new Notification({
                        text: options.text
                    })
                })
            });

            GenericPromptView.prototype.initialize.apply(this, arguments);
        }
    });

    return NotificationPromptView;
});