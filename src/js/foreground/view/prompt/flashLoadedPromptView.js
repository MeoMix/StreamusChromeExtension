define([
    'foreground/model/prompt',
    'foreground/view/prompt/promptContentView',
    'foreground/view/prompt/promptView'
], function (Prompt, PromptContentView, PromptView) {
    'use strict';

    var FlashLoadedPromptView = PromptView.extend({
        id: 'flashLoadedPrompt',

        initialize: function () {
            this.model = new Prompt({
                showCancelButton: false
            });

            this.contentView = new PromptContentView({
                //  TODO: i18n
                template: _.template('Another extension has forced YouTube to use Flash.</br></br> Streamus will not work properly until that extension is disabled and Streamus is restarted.')
            });

            PromptView.prototype.initialize.apply(this, arguments);
        },
    });

    return FlashLoadedPromptView;
});