define([
    'text!../template/clearStreamPrompt.htm',
    'confirmPromptView',
    'settings'
], function (ClearStreamPromptTemplate, ConfirmPromptView, Settings) {
    'use strict';

    var ClearStreamPromptView = ConfirmPromptView.extend({

        className: ConfirmPromptView.prototype.className + ' clearStreamPrompt',

        template: _.template(ClearStreamPromptTemplate),
        
        reminderCheckbox: null,
        
        render: function() {
            ConfirmPromptView.prototype.render.call(this, {}, arguments);

            this.reminderCheckbox = this.$el.find('input#remindClearStream');

            return this;
        },

        doOk: function () {
            
            var remindClearStream = !this.$el.find('input#remindClearStream').is(':checked');
            Settings.set('remindClearStream', remindClearStream);

            this.model.clear();
            this.fadeOutAndHide();
        }

    });

    return ClearStreamPromptView;
});