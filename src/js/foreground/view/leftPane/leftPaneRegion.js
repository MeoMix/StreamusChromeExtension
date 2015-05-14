define(function(require) {
    'use strict';

    var LeftPaneView = require('foreground/view/leftPane/leftPaneView');

    var LeftPaneRegion = Marionette.Region.extend({
        settings: null,

        initialize: function(options) {
            this.settings = options.settings;
            this.listenTo(Streamus.channels.foregroundArea.vent, 'rendered', this._onForegroundAreaRendered);
            this.listenTo(Streamus.channels.foregroundArea.vent, 'idle', this._onForegroundAreaIdle);
        },

        _onForegroundAreaRendered: function() {
            if (!this.settings.get('openToSearch')) {
                this._showLeftPaneView();
            }
        },

        _onForegroundAreaIdle: function() {
            //  If search is being shown immediately then its OK to defer loading to improve initial
            //  load performance.
            if (this.settings.get('openToSearch')) {
                this._showLeftPaneView();
            }
        },

        _showLeftPaneView: function() {
            if (!this._leftPaneViewExists()) {
                this.show(new LeftPaneView({
                    signInManager: Streamus.backgroundPage.signInManager
                }));
            }
        },

        //  Returns true if LeftPaneView is currently shown in the region
        _leftPaneViewExists: function() {
            return !_.isUndefined(this.currentView);
        }
    });

    return LeftPaneRegion;
});