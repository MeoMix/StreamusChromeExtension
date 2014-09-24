define(function () {
    'use strict';

    var Application = Backbone.Marionette.Application.extend({
        backgroundPage: null,
        
        initialize: function() {
            this._configureQtip();
            this._setBackgroundPage();
            this.on('start', this._showForeground);
        },

        //  Configure qTip2's default behavior.
        _configureQtip: function () {
            this._setQtipPositioning();
            this._setQtipStyle();
        },
        
        _setBackgroundPage: function () {
            this.backgroundPage = chrome.extension.getBackgroundPage();
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

    var streamus = new Application();
    window.Streamus = streamus;

    streamus.start();
});