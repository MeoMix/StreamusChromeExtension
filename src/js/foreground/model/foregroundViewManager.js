define(function () {
    'use strict';

    var ForegroundViewManager = Backbone.Model.extend({
        
        defaults: function () {
            return {
                views: []
            };
        },

        initialize: function() {
            $(window).unload(function () {
                this.allViewsStopListening();
            }.bind(this));
        },
        
        allViewsStopListening: function() {

            _.each(this.get('views'), function(view) {
                view.stopListening();
            });

        }

    });

    return new ForegroundViewManager();
});