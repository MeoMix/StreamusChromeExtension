define(function() {
    'use strict';

    //  TODO: Prefer using a Behavior instead of inheritance.
    var DialogContentView = MarionetteForeground.LayoutView.extend({
        className: 'dialog-content'
    });

    return DialogContentView;
});