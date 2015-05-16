define(function(require) {
    'use strict';

    var SimpleMenuItemsView = require('foreground/view/element/simpleMenuItemsView');
    var SimpleMenuTemplate = require('text!template/element/simpleMenu.html');

    var SimpleMenuView = Marionette.LayoutView.extend({
        id: 'simpleMenu',
        className: 'panel menu',
        template: _.template(SimpleMenuTemplate),

        regions: {
            simpleMenuItemsRegion: '[data-region=simpleMenuItems]'
        },

        ui: {
            fixedMenuItem: '[data-ui~=fixedMenuItem]',
            panelContent: '[data-ui~=panelContent]'
        },

        events: {
            'click @ui.fixedMenuItem': '_onClickFixedMenuItem'
        },

        childEvents: {
            'click:simpleMenuItem': '_onClickSimpleMenuItem'
        },

        listItemHeight: 0,
        simpleMenuItems: null,

        initialize: function(options) {
            this.simpleMenuItems = options.simpleMenuItems;
            this.listItemHeight = _.isUndefined(options.listItemHeight) ? this.listItemHeight : options.listItemHeight;
            this.listenTo(Streamus.channels.element.vent, 'click', this._onElementClick);
        },

        onRender: function() {
            this.showChildView('simpleMenuItemsRegion', new SimpleMenuItemsView({
                collection: this.simpleMenuItems,
                listItemHeight: this.listItemHeight
            }));
        },

        onAttach: function() {
            //  This needs to be ran on the parent because _centerActive has a dependency on simpleMenuItems scrollTop which is set here.
            this.getChildView('simpleMenuItemsRegion').ensureActiveIsVisible();

            if (this.listItemHeight > 0) {
                this._centerActive();
            }

            requestAnimationFrame(function() {
                this.$el.addClass('is-visible');
            }.bind(this));
        },

        hide: function() {
            Streamus.channels.simpleMenu.vent.trigger('hidden');
            this.ui.panelContent.off('webkitTransitionEnd').one('webkitTransitionEnd', this._onTransitionOutComplete.bind(this));
            this.$el.removeClass('is-visible');
        },

        _onClickSimpleMenuItem: function() {
            this.triggerMethod('click:simpleMenuItem', {
                view: this,
                model: this.model,
                collection: this.simpleMenuItems
            });
            Streamus.channels.simpleMenu.vent.trigger('clicked:item');
            this.hide();
        },

        _onClickFixedMenuItem: function() {
            this.triggerMethod('click:fixedMenuItem', {
                view: this,
                model: this.model,
                collection: this.simpleMenuItems
            });
            Streamus.channels.simpleMenu.vent.trigger('clicked:item');
            this.hide();
        },

        _onTransitionOutComplete: function() {
            this.destroy();
        },

        _onElementClick: function(event) {
            //  These targets can show up when dragging the scrollbar and it's weird to close when interacting with scrollbar.
            if (event.target !== this.getRegion('simpleMenuItemsRegion').el) {
                this.hide();
            }
        },

        //  TODO: This should also take into account overflow. If overflow would happen, abandon trying to perfectly center and keep the menu within the viewport.
        //  When showing this view over a ListItem, center the view's active item over the ListItem.
        _centerActive: function() {
            //  Adjust the top position of the view based on which item is active.
            var index = this.simpleMenuItems.indexOf(this.simpleMenuItems.getActive());

            //  TODO: This feels weirdly coupled.
            var childHeight = this.getChildView('simpleMenuItemsRegion').children.first().$el.height();
            var offset = -1 * index * childHeight;

            //  Account for the fact that the view could be scrolling to show the child so that an offset derived just by index is insufficient.
            var scrollTop = this.getChildView('simpleMenuItemsRegion').el.scrollTop;
            offset += scrollTop;

            //  Now center the item over its ListItem
            var paddingTop = parseInt(this.ui.panelContent.css('padding-top'));
            var centering = (this.listItemHeight - childHeight - paddingTop) / 2;

            this.$el.css('top', offset + centering);
        }
    });

    return SimpleMenuView;
});