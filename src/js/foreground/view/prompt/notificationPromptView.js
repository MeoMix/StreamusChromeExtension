define([
    'foreground/model/genericPrompt',
    'foreground/view/prompt/genericPromptView',
    'foreground/view/notificationView'
], function (GenericPrompt, GenericPromptView, NotificationView) {
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
            
            GenericPromptView.prototype.initialize.call(this, arguments);
        }
    });

    return NotificationPromptView;
});