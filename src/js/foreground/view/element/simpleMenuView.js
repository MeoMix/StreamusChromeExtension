define(function (require) {
    'use strict';

    var SimpleMenuItemView = require('foreground/view/element/simpleMenuItemView');
    var SimpleMenuTemplate = require('text!template/element/simpleMenu.html');

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
                fixedMenuItem: '#' + this.id + '-fixedMenuItem',
                panelContent: '#' + this.id + '-panelContent'
            };
        },
        
        events: {
            'click @ui.simpleMenuItems': '_onClickSimpleMenuItems',
            'click @ui.fixedMenuItem': '_onClickFixedMenuItem'
        },
        
        listItemHeight: 0,
        
        initialize: function(options) {
            this.listItemHeight = options && options.listItemHeight ? options.listItemHeight : this.listItemHeight;
            this.listenTo(Streamus.channels.element.vent, 'click', this._onElementClick);
        },
        
        onAttach: function () {
            this._ensureSelectedIsVisible();
            
            if (this.listItemHeight > 0) {
                this._centerSelected();
            }

            _.defer(function() {
                this.$el.addClass('is-visible');
            }.bind(this));
            
            //  TODO: Keep DRY w/ scrollable.
            //  More info: https://github.com/noraesae/perfect-scrollbar
            //  This needs to be ran during onShow for perfectScrollbar to do its math properly.
            this.ui.simpleMenuItems.perfectScrollbar({
                suppressScrollX: true,
                //  44px because that is the height of 1 listItem--small
                minScrollbarLength: 44,
                includePadding: true
            });
        },
        
        hide: function () {
            this.ui.panelContent.off('webkitTransitionEnd').one('webkitTransitionEnd', this._onTransitionOutComplete.bind(this));
            this.$el.removeClass('is-visible');
        },
        
        _onClickSimpleMenuItems: function() {
            this.triggerMethod('click:simpleMenuItem', {
                view: this,
                model: this.model,
                collection: this.collection
            });
            this.hide();
        },
        
        _onClickFixedMenuItem: function() {
            this.triggerMethod('click:fixedMenuItem', {
                view: this,
                model: this.model,
                collection: this.collection
            });
            this.hide();
        },
		
        _onTransitionOutComplete: function () {
            this.destroy();
        },
        
        _onElementClick: function (event) {
            //  This target will show up when dragging the scrollbar and it's weird to close when interacting with scrollbar.
            if (event.target !== this.ui.panelContent[0]) {
                this.hide();
            }
        },
        
        //  Adjust the scrollTop of the view to ensure that the selected item is shown.
        _ensureSelectedIsVisible: function () {
            var selectedItem = this.collection.getSelected();
            
            if (!_.isUndefined(selectedItem)) {
                var selectedView = this.children.find(function (child) {
                    return child.model === selectedItem;
                });
                
                selectedView.el.scrollIntoView();
            }
        },
        
        //  When showing this view over a ListItem, center the view's selected item over the ListItem.
        _centerSelected: function () {
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