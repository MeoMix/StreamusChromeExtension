define([
    'foreground/view/element/simpleMenuItemView',
    'text!template/element/simpleMenu.html'
], function (SimpleMenuItemView, SimpleMenuTemplate) {
    'use strict';

    var SimpleMenuView = Marionette.CompositeView.extend({
        id: 'simpleMenu',
        className: 'panel menu',
        template: _.template(SimpleMenuTemplate),
        templateHelpers: function () {
            return {
                viewId: this.id
            };
        },

        childView: SimpleMenuItemView,
        childViewContainer: '@ui.simpleMenuItems',
        
        ui: function () {
            return {
                simpleMenuItems: '#' + this.id + '-simpleMenuItems',
                panelContent: '#' + this.id + '-panelContent'
            };
        },
        
        triggers: {
            'click': 'click:simpleMenuItem'
        },
        
        listItemHeight: 0,
        
        initialize: function(options) {
            this.listItemHeight = options.listItemHeight;
        },
        
        onShow: function () {
            this._centerSelected();
            this.$el.addClass('is-visible');
        },
        
        hide: function () {
            this.ui.panelContent.off('webkitTransitionEnd').one('webkitTransitionEnd', this._onTransitionOutComplete.bind(this));
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

    return SimpleMenuView;
});