define([
    'text!../templates/loadingSpinnerTemplate.htm'
], function (LoadingSpinnerTemplate) {
    'use strict';

    var LoadingSpinnerView = Backbone.View.extend({

        className: 'loadingSpinner above',

        template: _.template(LoadingSpinnerTemplate),

        render: function () {
            this.$el.html(this.template());

            return this;
        }
    });

    return LoadingSpinnerView;
});