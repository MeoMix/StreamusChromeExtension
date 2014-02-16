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
            }
        },
        
        unsubscribe: function (view) {
            var views = this.get('views');
            var index = views.indexOf(view);
            
            if (index > -1) {
                views.splice(index, 1);
            }
        }

    });

    return new ForegroundViewManager();
});