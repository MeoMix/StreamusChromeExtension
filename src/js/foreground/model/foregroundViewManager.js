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
                console.log('views subscribed');
                views.push(view);
            } else {
                console.error("Already subscribed to view:", view);
            }

            console.log("Views length:", views.length);
        },
        
        unsubscribe: function (view) {
            var views = this.get('views');
            var index = views.indexOf(view);
            
            if (index > -1) {
                console.log('view unsubscribed');
                views.splice(index, 1);
            } else {
                console.error("Failed to unsubscribe view:", view);
            }

            console.log("views length:", views.length);
        }

    });

    return new ForegroundViewManager();
});