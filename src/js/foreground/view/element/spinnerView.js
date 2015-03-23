define(function(require) {
    'use strict';

    var SpinnerTemplate = require('text!template/element/spinner.html');

    var SpinnerView = Marionette.ItemView.extend({
        tagName: 'spinner',
        template: _.template(SpinnerTemplate)
    });

    return SpinnerView;
});