define([
    'genericPromptView'
], function (GenericPromptView) {
    'use strict';

    var ConfirmPromptView = GenericPromptView.extend({

        className: GenericPromptView.prototype.className + ' confirmPrompt',
        
        initialize: function() {
            
        }

    });

    return ConfirmPromptView;
});