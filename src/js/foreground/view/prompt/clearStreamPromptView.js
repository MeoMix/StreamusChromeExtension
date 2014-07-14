define([
    'foreground/model/genericPrompt',
    'foreground/view/clearStreamView',
    'foreground/view/prompt/genericPromptView'
], function (GenericPrompt, ClearStreamView, GenericPromptView) {
    'use strict';
    
    var Settings = chrome.extension.getBackgroundPage().Settings;

    var ClearStreamPromptView = GenericPromptView.extend({
        initialize: function () {
            this.model = new GenericPrompt({
                title: chrome.i18n.getMessage('areYouSure'),
                view: new ClearStreamView()
            });
            
            GenericPromptView.prototype.initialize.apply(this, arguments);
        },

        reminderDisabled: function () {
            return !Settings.get('remindClearStream');
        }
    });

    return ClearStreamPromptView;
});