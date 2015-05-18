define(function(require) {
    'use strict';

    var ContextMenuTemplate = require('text!template/contextMenu/contextMenu.html');
    var ContextMenuItemsView = require('foreground/view/contextMenu/contextMenuItemsView');
    var utility = require('common/utility');

    var ContextMenuView = Marionette.LayoutView.extend({
        id: 'contextMenu',
        className: 'menu panel',
        template: _.template(ContextMenuTemplate),

        regions: {
            contextMenuItems: '[data-region=contextMenuItems]'
        },

        onRender: function() {
            this.showChildView('contextMenuItems', new ContextMenuItemsView({
                collection: this.model.get('items')
            }));
        },

        onAttach: function() {
            var offsetTop = utility.flipInvertOffset(this.model.get('top'), this.$el.outerHeight(), this.model.get('containerHeight'));
            var offsetLeft = utility.flipInvertOffset(this.model.get('left'), this.$el.outerWidth(), this.model.get('containerWidth'));

            this.$el.offset({
                top: offsetTop,
                left: offsetLeft
            });

            this.$el.addClass('is-visible');
        },

        hide: function() {
            this.$el.off('webkitTransitionEnd').one('webkitTransitionEnd', this._onTransitionOutComplete.bind(this));
            this.$el.removeClass('is-visible');
        },

        _onTransitionOutComplete: function() {
            this.model.get('items').reset();
            this.destroy();
        }
    });

    return ContextMenuView;
});