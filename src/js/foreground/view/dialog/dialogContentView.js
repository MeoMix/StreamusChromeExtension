define(function(require) {
    'use strict';

    var Scrollable = require('foreground/view/behavior/scrollable');

    //  TODO: Prefer using a Behavior instead of inheritance.
    var DialogContentView = Marionette.LayoutView.extend({
        className: 'dialog-content',

        behaviors: {
            Scrollable: {
                behaviorClass: Scrollable
            }
        }
    });

    return DialogContentView;
});