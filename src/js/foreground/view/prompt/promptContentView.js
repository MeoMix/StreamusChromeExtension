define(function () {
    'use strict';

    //  TODO: Prefer using a Behavior instead of inheritance.
    var PromptContentView = Marionette.LayoutView.extend({
        className: 'prompt-content'
    });

    return PromptContentView;
});