define(function(require) {
    'use strict';

    var SimpleMenuItemsView = require('foreground/view/simpleMenu/simpleMenuItemsView');
    var SimpleMenuItemView = require('foreground/view/simpleMenu/simpleMenuItemView');
    var SimpleMenuTemplate = require('text!template/simpleMenu/simpleMenu.html');
    var utility = require('common/utility');

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
            'click:item': '_onClickItem'
        },

        initialize: function() {
            //  Defer binding event listeners which will hide this view to ensure that events which
            //  were responsible for showing it do not also result in hiding.
            _.defer(function() {
                if (!this.isDestroyed) {
                    this.listenTo(Streamus.channels.element.vent, 'click', this._onElementClick);
                    this.listenTo(Streamus.channels.element.vent, 'drag', this._onElementDrag);

                    if (this.model.get('isContextMenu')) {
                        this.listenTo(Streamus.channels.element.vent, 'contextMenu', this._onElementContextMenu);
                    }
                }
            }.bind(this));
        },

        onRender: function() {
            this.showChildView('simpleMenuItems', new SimpleMenuItemsView({
                collection: this.model.get('simpleMenuItems'),
                listItemHeight: this.model.get('listItemHeight')
            }));

            if (this.model.has('fixedMenuItem')) {
                this.showChildView('fixedMenuItem', new SimpleMenuItemView({
                    model: this.model.get('fixedMenuItem')
                }));
            }
        },

        onAttach: function() {
            if (this.model.get('reposition')) {
                this._setPosition(this.model.get('repositionData'));
            }

            //  This needs to be ran on the parent because _centerActive has a dependency on simpleMenuItems scrollTop which is set here.
            this.getChildView('simpleMenuItems').ensureActiveIsVisible();
            this._centerActive(this.model.get('listItemHeight'));

            this.$el.addClass('is-visible');
        },

        hide: function() {
            Streamus.channels.simpleMenu.vent.trigger('hidden');
            this.ui.panelContent.off('webkitTransitionEnd').one('webkitTransitionEnd', this._onTransitionOutComplete.bind(this));
            this.$el.removeClass('is-visible');
        },

        _onClickItem: function() {
            Streamus.channels.simpleMenu.vent.trigger('clicked:item');
            this.hide();
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

        _onElementDrag: function() {
            this.hide();
        },

        //  If a context menu click occurs and this menu is a context menu, hide it.
        _onElementContextMenu: function() {
            this.hide();
        },

        _setPosition: function(positionData) {
            var offsetTop = utility.flipInvertOffset(positionData.top, this.$el.outerHeight(), positionData.containerHeight);
            var offsetLeft = utility.flipInvertOffset(positionData.left, this.$el.outerWidth(), positionData.containerWidth);

            this.$el.offset({
                top: offsetTop,
                left: offsetLeft
            });
        },

        //  This should also take into account overflow. If overflow would happen, abandon trying to perfectly center and keep the menu within the viewport.
        //  https://github.com/MeoMix/StreamusChromeExtension/issues/566
        //  When showing this view over a ListItem, center the view's active item over the ListItem.
        _centerActive: function(listItemHeight) {
            if (listItemHeight > 0) {
                var offsetData = this.getChildView('simpleMenuItems').getActiveItemOffsetData();
                //  Center the offset over the listItem using logic outlined in Material guidelines
                //  http://www.google.com/design/spec/components/menus.html#menus-simple-menus
                var paddingTop = parseInt(this.ui.panelContent.css('padding-top'), 10);
                var centering = (listItemHeight - offsetData.itemHeight) / 2 - paddingTop;
                var topOffset = offsetData.itemOffset + centering;

                this.$el.css('top', topOffset);
            }
        }
    });

    return SimpleMenuView;
});