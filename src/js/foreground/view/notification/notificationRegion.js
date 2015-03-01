define(function(require) {
    'use strict';

    var Notification = require('foreground/model/notification');
    var NotificationView = require('foreground/view/notification/notificationView');

    var NotificationRegion = Marionette.Region.extend({
        el: '#foregroundArea-notificationRegion',
        hideTimeout: null,
        hideTimeoutDelay: 3000,

        initialize: function() {
            this.listenTo(Streamus.channels.notification.commands, 'show:notification', this._showNotification);
            this.listenTo(Streamus.channels.notification.commands, 'hide:notification', this._hideNotification);
            this.listenTo(Streamus.channels.element.vent, 'click', this._onElementClick);
            this.listenTo(Streamus.backgroundChannels.notification.commands, 'show:notification', this._showNotification);
        },

        _onElementClick: function() {
            if (!_.isUndefined(this.currentView)) {
                this._hideNotification();
            }
        },

        _showNotification: function(notificationOptions) {
            //  It's important to defer showing notification because they're often shown via user click events.
            //  Since a click with a notification shown will cause the notification to hide -- need to wait until after click event
            //  finishes propagating before showing a notification.
            _.defer(function() {
                this.show(new NotificationView({
                    model: new Notification(notificationOptions)
                }));

                this._setHideTimeout();
                this.$el.addClass('is-visible');
            }.bind(this));
        },

        onSwap: function() {
            //  Timeout will go rogue when swapping views because empty is called without _hideNotification being called.
            this._clearHideTimeout();
        },

        _setHideTimeout: function() {
            this.hideTimeout = setTimeout(this._hideNotification.bind(this), this.hideTimeoutDelay);
        },

        _clearHideTimeout: function() {
            clearTimeout(this.hideTimeout);
        },

        _hideNotification: function() {
            this._clearHideTimeout();
            this.$el.off('webkitTransitionEnd').one('webkitTransitionEnd', this._onTransitionOutComplete.bind(this));
            this.$el.removeClass('is-visible');
        },

        _onTransitionOutComplete: function() {
            this.empty();
        }
    });

    return NotificationRegion;
});