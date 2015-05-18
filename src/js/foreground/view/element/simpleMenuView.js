define(function(require) {
    'use strict';

    var SimpleMenuItemsView = require('foreground/view/element/simpleMenuItemsView');
    var FixedMenuItemView = require('foreground/view/element/fixedMenuItemView');
    var SimpleMenuTemplate = require('text!template/element/simpleMenu.html');

    var SimpleMenuView = Marionette.LayoutView.extend({
        id: 'simpleMenu',
        className: 'panel menu',
        template: _.template(SimpleMenuTemplate),

        regions: {
            simpleMenuItems: '[data-region=simpleMenuItems]',
            fixedMenuItem: '[data-region=fixedMenuItem]'
        },

        ui: {
            panelContent: '[data-ui~=panelContent]'
        },

        childEvents: {
            'click:simpleMenuItem': '_onClickSimpleMenuItem',
            'click:fixedMenuItem': '_onClickFixedMenuItem'
        },

        initialize: function() {
            this.listenTo(Streamus.channels.element.vent, 'click', this._onElementClick);
        },

        onRender: function() {
            this.showChildView('simpleMenuItems', new SimpleMenuItemsView({
                collection: this.model.get('simpleMenuItems'),
                listItemHeight: this.model.get('listItemHeight')
            }));

            if (this.model.has('fixedMenuItem')) {
                this.showChildView('fixedMenuItem', new FixedMenuItemView({
                    model: this.model.get('fixedMenuItem')
                }));
            }
        },

        onAttach: function() {
            //  This needs to be ran on the parent because _centerActive has a dependency on simpleMenuItems scrollTop which is set here.
            this.getChildView('simpleMenuItems').ensureActiveIsVisible();

            var listItemHeight = this.model.get('listItemHeight');
            if (listItemHeight > 0) {
                this._centerActive(listItemHeight);
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
            this._handleClickedMenuItem('simpleMenuItem');
        },

        _onClickFixedMenuItem: function() {
            this._handleClickedMenuItem('fixedMenuItem');
        },

        _onTransitionOutComplete: function() {
            this.destroy();
        },

        _onElementClick: function(event) {
            //  These targets can show up when dragging the scrollbar and it's weird to close when interacting with scrollbar.
            if (event.target !== this.getRegion('simpleMenuItems').el) {
                this.hide();
            }
        },

        _handleClickedMenuItem: function(menuItemType) {
            this.triggerMethod('click:' + menuItemType, {
                view: this,
                model: this.model
            });
            Streamus.channels.simpleMenu.vent.trigger('clicked:item');
            this.hide();
        },

        //  TODO: This should also take into account overflow. If overflow would happen, abandon trying to perfectly center and keep the menu within the viewport.
        //  When showing this view over a ListItem, center the view's active item over the ListItem.
        _centerActive: function(listItemHeight) {
            var offsetData = this.getChildView('simpleMenuItems').getActiveItemOffsetData();
            //  Center the offset over the listItem using logic outlined in Material guidelines
            //  http://www.google.com/design/spec/components/menus.html#menus-simple-menus
            var paddingTop = parseInt(this.ui.panelContent.css('padding-top'));
            var centering = (listItemHeight - offsetData.itemHeight) / 2 - paddingTop;
            var topOffset = offsetData.itemOffset + centering;

            this.$el.css('top', topOffset);
        }
    });

    return SimpleMenuView;
});