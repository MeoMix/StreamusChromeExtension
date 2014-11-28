define([
    'foreground/view/stream/activeStreamItemView'
], function (ActiveStreamItemView) {
    'use strict';

    var ActiveStreamItemRegion = Marionette.Region.extend({
        showView: function (activeItem, instant) {
            this.show(new ActiveStreamItemView({
                model: activeItem
            }));

            if (instant) {
                this.$el.addClass('is-instant');
            } else {
                this.$el.off('webkitTransitionEnd').on('webkitTransitionEnd', this._onTransitionInComplete.bind(this));
                Streamus.channels.activeStreamItemArea.vent.trigger('beforeShow');
            }

            this.$el.addClass('is-visible');
            
            if (instant) {
                Streamus.channels.activeStreamItemArea.vent.trigger('shown');
            }
        },
        
        hideView: function () {
            this.$el.off('webkitTransitionEnd').on('webkitTransitionEnd', this._onTransitionOutComplete.bind(this));
            this.$el.removeClass('is-instant is-visible');
        },
        
        _onTransitionInComplete: function (event) {
            console.log('shown!');
            if (event.target === event.currentTarget) {
                this.$el.off('webkitTransitionEnd');
                Streamus.channels.activeStreamItemArea.vent.trigger('shown');
            }
        },
        
        _onTransitionOutComplete: function (event) {
            if (event.target === event.currentTarget) {
                this.$el.off('webkitTransitionEnd');
                this.empty();
                Streamus.channels.activeStreamItemArea.vent.trigger('hidden');
            }
        }
    });

    return ActiveStreamItemRegion;
});