define([
    'foreground/model/genericPrompt',
    'foreground/view/voteStreamusView',
    'foreground/view/prompt/genericPromptView'
], function (GenericPrompt, VoteStreamusView, GenericPromptView) {
    'use strict';

    var UpdateStreamusPromptView = GenericPromptView.extend({
        model: null,

        initialize: function () {
            this.model = new GenericPrompt({
                title: "Please vote for Streamus",
                view: new VoteStreamusView()
            });
            
            GenericPromptView.prototype.initialize.apply(this, arguments);
        }
    });

    return UpdateStreamusPromptView;
});