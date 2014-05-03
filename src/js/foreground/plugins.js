define([
    'backbone',
    'backbone.marionette',
    'googleAnalytics',
    'jquery.hoverIntent',
    'jquery',
    'jquery.qtip',
    'jquery.transit',
    'jqueryUi',
    'less',
    'lodash',
    'selectize'
], function () {
    
    //  TODO: FIX by introducing an Application object for another level of granularity!
    require(['foreground/view/behavior/behaviors'], function (Behaviors) {
        Backbone.Marionette.Behaviors.behaviorsLookup = function () {
            return Behaviors;
        };
        
        //  Finally, load the foreground:
        require(['foreground/foreground']);
    });
});