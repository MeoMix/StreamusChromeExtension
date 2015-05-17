define(function(require) {
    'use strict';

    var ContextMenuItemView = require('foreground/view/contextMenu/contextMenuItemView');
    var ContextMenuTemplate = require('text!template/contextMenu/contextMenu.html');

    //  TODO: Refactor this to be a LayoutView with child CollectionView instead of a CompositeView.
    var ContextMenuView = Marionette.CompositeView.extend({
        id: 'contextMenu',
        className: 'menu panel',
        childView: ContextMenuItemView,
        childViewContainer: '@ui.contextMenuItems',
        template: _.template(ContextMenuTemplate),
        //  Used to determine whether contextMenu display should flip as to not overflow container
        containerHeight: 0,
        containerWidth: 0,

        ui: {
            contextMenuItems: '[data-ui~=contextMenuItems]'
        },

        initialize: function(options) {
            this.containerHeight = options.containerHeight;
            this.containerWidth = options.containerWidth;
        },

        onAttach: function() {
            var offsetTop = this._ensureOffset(this.model.get('top'), this.$el.outerHeight(), this.containerHeight);
            var offsetLeft = this._ensureOffset(this.model.get('left'), this.$el.outerWidth(), this.containerWidth);

            this.$el.offset({
                top: offsetTop,
                left: offsetLeft
            });

            this.$el.addClass('is-visible');
        },
        //  TODO: Move this logic to the ContextMenuRegion and use the same logic as in NotificationRegion.
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