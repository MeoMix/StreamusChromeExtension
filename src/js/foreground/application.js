define(function () {
    'use strict';
    var Application = new Backbone.Marionette.Application();
    
    //  Configure qTip2's default behavior.
    Application.addInitializer(function () {
        $.extend($.fn.qtip.defaults.position, {
            viewport: $(window),
            my: 'top center',
            at: 'bottom center',
            hide: {
                leave: false
            }
        });

        $.extend($.fn.qtip.defaults.style, {
            classes: 'qtip-light qtip-shadow'
        });
    });
    
    Application.on('initialize:after', function () {
        //  Fire up the foreground:
        require(['foreground/foreground']);
    });

    Application.start();

    //  Expose Application globally for referencing EventAggregator, etc. without incurring circular reference in requireJS.
    window.Application = Application;
});