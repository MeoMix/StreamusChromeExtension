define([
    'foreground/view/contextMenuItemView'
], function (ContextMenuItemView) {
    'use strict';

    var ContextMenuView = Backbone.Marionette.CompositeView.extend({
        id: 'context-menu',
        tagName: 'ul',
        childView: ContextMenuItemView,
        template: _.template(),
        //  Used to determine whether context-menu display should flip as to not overflow container
        containerHeight: 0,
        containerWidth: 0,
        
        initialize: function(options) {
            this.containerHeight = options.containerHeight;
            this.containerWidth = options.containerWidth;
        },

        onShow: function () {
            var offsetTop = this._ensureOffset(this.model.get('top'), this.$el.height(), this.containerHeight);
            var offsetLeft = this._ensureOffset(this.model.get('left'), this.$el.width(), this.containerWidth);

            this.$el.offset({
                top: offsetTop,
                left: offsetLeft
            });
        },
        
        //  Prevent displaying ContextMenu outside of viewport by ensuring its offsets are valid.
        _ensureOffset: function(offset, elementSize, containerSize) {
            var ensuredOffset = offset;
            var needsFlip = offset + elementSize > containerSize;
            
            if (needsFlip) {
                ensuredOffset -= elementSize;
            }

            return ensuredOffset;
        }
    });

    return ContextMenuView;
});