define([
    'text!../template/clearStreamPrompt.htm',
    'confirmPromptView'
], function (ClearStreamPromptTemplate, ConfirmPromptView) {
    'use strict';

    var ClearStreamPromptView = ConfirmPromptView.extend({

        className: ConfirmPromptView.prototype.className + ' clearStreamPrompt',

        template: _.template(ClearStreamPromptTemplate),

        doOk: function () {
            
            //  TODO: I want to read the state of the confirm checkbox and write it to localStorage.
            //  TODO: I want to read the state of the confirm checkbox and initialize with it.

            this.model.clear();
            this.fadeOutAndHide();
        }

    });

    return ClearStreamPromptView;
});