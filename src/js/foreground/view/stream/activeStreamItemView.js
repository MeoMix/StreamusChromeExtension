define([
    'foreground/model/timeArea',
    'foreground/view/behavior/tooltip',
    'foreground/view/stream/timeAreaView',
    'text!template/stream/activeStreamItem.html'
], function (TimeArea, Tooltip, TimeAreaView, ActiveStreamItemTemplate) {
    'use strict';

    var ActiveStreamItemView = Marionette.LayoutView.extend({
        id: 'activeStreamItem',
        template: _.template(ActiveStreamItemTemplate),

        regions: function () {
            return {
                timeAreaRegion: '#' + this.id + '-timeAreaRegion'
            };
        },

        behaviors: {
            Tooltip: {
                behaviorClass: Tooltip
            }
        },

        instant: false,

        initialize: function (options) {
            this.instant = options.instant;
        },

        onRender: function () {
            if (this.instant) {
                this.$el.addClass('is-instant');
            } else {
                this.$el.on('webkitTransitionEnd', this._onTransitionInComplete.bind(this));
            }
        },

        onShow: function () {
            this.timeAreaRegion.show(new TimeAreaView({
                model: new TimeArea({
                    totalTime: this.model.get('song').get('duration')
                })
            }));

            this.$el.addClass('is-visible');

            //  If the view is shown instantly then there is no transition to wait for, so announce shown immediately.
            if (this.instant) {
                //  TODO: make this be 'visible' rather than 'shown' cuz its not accurate.
                Streamus.channels.activeStreamItemArea.vent.trigger('shown');
            } else {
                Streamus.channels.activeStreamItemArea.vent.trigger('beforeShow');
            }
        },

        hide: function () {
            this.$el.on('webkitTransitionEnd', this._onTransitionOutComplete.bind(this));
            this.$el.removeClass('is-instant is-visible');
        },

        _onTransitionInComplete: function (event) {
            if (event.target === event.currentTarget) {
                this.$el.off('webkitTransitionEnd');
                Streamus.channels.activeStreamItemArea.vent.trigger('shown');
            }
        },

        _onTransitionOutComplete: function (event) {
            if (event.target === event.currentTarget) {
                this.$el.off('webkitTransitionEnd');
                Streamus.channels.activeStreamItemArea.vent.trigger('hidden');
                this.destroy();
            }
        }
    });

    return ActiveStreamItemView;
});