define(function(require) {
    'use strict';

    var TimeArea = require('foreground/model/timeArea');
    var Tooltipable = require('foreground/view/behavior/tooltipable');
    var TimeAreaView = require('foreground/view/stream/timeAreaView');
    var ActiveStreamItemTemplate = require('text!template/stream/activeStreamItem.html');
    var ContextMenuAction = require('foreground/model/contextMenuAction');

    var ActiveStreamItemView = Marionette.LayoutView.extend({
        id: 'activeStreamItem',
        className: 'activeStreamItem',
        template: _.template(ActiveStreamItemTemplate),

        regions: function() {
            return {
                timeAreaRegion: '#' + this.id + '-timeAreaRegion'
            };
        },

        events: {
            'contextmenu': '_onContextMenu'
        },

        behaviors: {
            Tooltipable: {
                behaviorClass: Tooltipable
            }
        },

        instant: false,
        player: null,

        initialize: function(options) {
            this.instant = options.instant;
            this.player = Streamus.backgroundPage.player;
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

        showContextMenu: function () {
            var contextMenuAction = new ContextMenuAction({
                song: this.model.get('song'),
                player: this.player
            });

            contextMenuAction.showContextMenu();
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
        },

        _onContextMenu: function () {
            event.preventDefault();
            this.showContextMenu();
        }
    });

    return ActiveStreamItemView;
});