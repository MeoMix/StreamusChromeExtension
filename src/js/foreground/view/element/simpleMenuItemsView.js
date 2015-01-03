define([
    'foreground/view/element/simpleMenuItemView'
], function (SimpleMenuItemView) {
    'use strict';

    var SimpleMenuItemsView = Marionette.CollectionView.extend({
        id: 'simpleMenuItems',
        className: 'panel menu',
        template: _.template(''),
        childView: SimpleMenuItemView,
        
        triggers: {
            'click': 'click:simpleMenuItem'
        },
        
        listItemHeight: 0,
        
        initialize: function(options) {
            this.listItemHeight = options.listItemHeight;
        },
        
        onShow: function() {
            this._centerSelected();
            this.$el.addClass('is-visible');
        },
        
        hide: function () {
            this.$el.off('webkitTransitionEnd').one('webkitTransitionEnd', this._onTransitionOutComplete.bind(this));
            this.$el.removeClass('is-visible');
        },
		
        _onTransitionOutComplete: function () {
            this.destroy();
        },
        
        _centerSelected: function() {
            //  Adjust the top position of the view based on which item is selected.
            var index = this.collection.indexOf(this.collection.getSelected());
            var childHeight = this.children.first().$el.height();
            var offset = -1 * index * childHeight;
            var centering = (this.listItemHeight - childHeight) / 2;
            //  Subtract 4 because of padding at the top of this.
            this.$el.css('top', offset + centering - 4);
        }
    });

    return SimpleMenuItemsView;
});