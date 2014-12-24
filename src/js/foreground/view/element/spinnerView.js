define([
    'text!template/element/spinner.html'
], function (SpinnerTemplate) {
    'use strict';

    var SpinnerView = Marionette.ItemView.extend({
        tagName: 'spinner',
        template: _.template(SpinnerTemplate)
    });

    return SpinnerView;
});