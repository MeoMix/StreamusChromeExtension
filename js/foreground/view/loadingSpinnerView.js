define(function () {
    'use strict';

    var LoadingSpinnerView = Backbone.View.extend({

        className: 'loadingSpinner above',

        template: _.template($('#loadingSpinnerTemplate').html()),

        render: function () {
            this.$el.html(this.template());

            return this;
        }
    });

    return LoadingSpinnerView;
});