define([
    'foreground/model/genericPrompt',
    'foreground/view/clearStreamView',
    'foreground/view/prompt/genericPromptView'
], function (GenericPrompt, ClearStreamView, GenericPromptView) {
    'use strict';
    
    var ClearStreamPromptView = GenericPromptView.extend({
        model: null,
        
        initialize: function () {

            this.model = new GenericPrompt({
                title: chrome.i18n.getMessage('areYouSure'),
                view: new ClearStreamView()
            });
            
            GenericPromptView.prototype.initialize.call(this, arguments);
        }
    });

    return ClearStreamPromptView;
});