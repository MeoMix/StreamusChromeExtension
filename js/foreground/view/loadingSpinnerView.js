define(function () {
    'use strict';

    var LoadingSpinnerView = Backbone.View.extend({

        className: 'loading',

        template: _.template($('#loadingSpinnerTemplate').html()),

        render: function () {
            this.$el.html(this.template());

            return this;
        }
    });

    return LoadingSpinnerView;
});