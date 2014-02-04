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

        },
        
        subscribe: function (view) {
            
            var views = this.get('views');
            var index = views.indexOf(view);

            if (index === -1) {
                views.push(view);
            } else {
                console.error("Already subscribed to view:", view);
            }

        },
        
        unsubscribe: function (view) {
            var views = this.get('views');
            var index = views.indexOf(view);
            
            if (index > -1) {
                views.splice(index, 1);
            } else {
                console.error("Failed to unsubscribe view:", view);
            }
        }

    });

    return new ForegroundViewManager();
});