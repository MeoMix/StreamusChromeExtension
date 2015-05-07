define(function(require) {
    'use strict';

    var TimeArea = require('foreground/model/timeArea');
    var Tooltip = require('foreground/view/behavior/tooltip');
    var TimeAreaView = require('foreground/view/stream/timeAreaView');
    var ActiveStreamItemTemplate = require('text!template/stream/activeStreamItem.html');

    var ActiveStreamItemView = Marionette.LayoutView.extend({
        id: 'activeStreamItem',
        className: 'activeStreamItem',
        template: _.template(ActiveStreamItemTemplate),

        regions: function() {
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

        initialize: function(options) {
            this.instant = options.instant;
        },

        onRender: function() {
            if (this.instant) {
                this.$el.addClass('is-instant');
            } else {
                this.$el.on('webkitTransitionEnd', this._onTransitionInComplete.bind(this));
            }

            this.showChildView('timeAreaRegion', new TimeAreaView({
                model: new TimeArea({
                    totalTime: this.model.get('song').get('duration')
                })
            }));
        },

        onAttach: function() {
            //  If the view is shown instantly then there is no transition to wait for, so announce shown immediately.
            if (this.instant) {
                this.$el.addClass('is-visible');
                Streamus.channels.activeStreamItemArea.vent.trigger('visible');
            } else {
                requestAnimationFrame(function() {
                    this.$el.addClass('is-visible');
                }.bind(this));

                Streamus.channels.activeStreamItemArea.vent.trigger('beforeVisible');
            }
        },

        hide: function() {
            this.$el.on('webkitTransitionEnd', this._onTransitionOutComplete.bind(this));
            this.$el.removeClass('is-instant is-visible');
        },

        _onTransitionInComplete: function(event) {
            if (event.target === event.currentTarget) {
                this.$el.off('webkitTransitionEnd');
                Streamus.channels.activeStreamItemArea.vent.trigger('visible');
            }
        },

        _onTransitionOutComplete: function(event) {
            if (event.target === event.currentTarget) {
                this.$el.off('webkitTransitionEnd');
                Streamus.channels.activeStreamItemArea.vent.trigger('hidden');
                this.destroy();
            }
        }
    });

    return ActiveStreamItemView;
});