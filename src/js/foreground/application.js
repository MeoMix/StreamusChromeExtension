define(function () {
    'use strict';

    var Application = Backbone.Marionette.Application.extend({
        initialize: function () {
            this._configureQtip();
            this.on('start', this._showForeground);
        },

        //  Configure qTip2's default behavior.
        _configureQtip: function () {
            this._setQtipPositioning();
            this._setQtipStyle();
        },
        
        _setQtipPositioning: function () {
            $.extend($.fn.qtip.defaults.position, {
                viewport: $(window),
                my: 'top center',
                at: 'bottom center',
                hide: {
                    leave: false
                }
            });
        },
        
        _setQtipStyle: function() {
            $.extend($.fn.qtip.defaults.style, {
                classes: 'qtip-light qtip-shadow'
            });
        },
        
        _showForeground: function() {
            //  Fire up the foreground:
            require(['foreground/view/foregroundView']);
        }
    });

    var application = new Application();
    application.start();
});