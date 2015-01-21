define(function () {
    'use strict';

    //  TODO: Prefer using a Behavior instead of inheritance.
    var DialogContentView = Marionette.LayoutView.extend({
        className: 'dialog-content'
    });

    return DialogContentView;
});