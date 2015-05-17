define(function(require) {
    'use strict';

    var ContextMenuTemplate = require('text!template/contextMenu/contextMenu.html');
    var ContextMenuItemsView = require('foreground/view/contextMenu/contextMenuItemsView');

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
            var offsetTop = this._ensureOffset(this.model.get('top'), this.$el.outerHeight(), this.model.get('containerHeight'));
            var offsetLeft = this._ensureOffset(this.model.get('left'), this.$el.outerWidth(), this.model.get('containerWidth'));

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
        },
        
        //  Prevent displaying ContextMenu outside of viewport by ensuring its offsets are valid.
        _ensureOffset: function(offset, elementDimension, containerDimension) {
            var ensuredOffset = offset;
            var needsFlip = offset + elementDimension > containerDimension;

            if (needsFlip) {
                ensuredOffset -= elementDimension;
            }

            return ensuredOffset;
        }
    });

    return ContextMenuView;
});