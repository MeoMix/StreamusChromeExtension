define(function(require) {
  'use strict';

  var SimpleMenuItemsView = require('foreground/view/simpleMenu/simpleMenuItemsView');
  var SimpleMenuItemView = require('foreground/view/simpleMenu/simpleMenuItemView');
  var SimpleMenuTemplate = require('text!template/simpleMenu/simpleMenu.html');
  var FixedPosition = require('foreground/enum/fixedPosition');
  var utility = require('common/utility');

  var SimpleMenuView = Marionette.LayoutView.extend({
    id: 'simpleMenu',
    className: 'menu panel',
    template: _.template(SimpleMenuTemplate),

    regions: {
      simpleMenuItems: 'simpleMenuItems',
      fixedTopMenuItem: 'fixedTopMenuItem',
      fixedBottomMenuItem: 'fixedBottomMenuItem'
    },

    ui: {
      panelContent: 'panelContent'
    },

    childEvents: {
      'click:item': '_onClickItem'
    },

    initialize: function() {
      // Defer binding event listeners which will hide this view to ensure that events which
      // were responsible for showing it do not also result in hiding.
      _.defer(function() {
        if (!this.isDestroyed) {
          this.listenTo(StreamusFG.channels.element.vent, 'click', this._onElementClick);
          this.listenTo(StreamusFG.channels.element.vent, 'drag', this._onElementDrag);

          if (this.model.get('isContextMenu')) {
            this.listenTo(StreamusFG.channels.element.vent, 'contextMenu', this._onElementContextMenu);
          }
        }
      }.bind(this));
    },

    onRender: function() {
      this.showChildView('simpleMenuItems', new SimpleMenuItemsView({
        collection: this.model.get('simpleMenuItems'),
        listItemHeight: this.model.get('listItemHeight')
      }));

      var fixedMenuItem = this.model.get('fixedMenuItem');
      if (!_.isNull(fixedMenuItem)) {
        this._showFixedMenuItem(fixedMenuItem);
      }
    },

    onAttach: function() {
      if (this.model.get('reposition')) {
        this._setPosition(this.model.get('repositionData'));
      }

      // This needs to be ran on the parent because _centerActive has a dependency on simpleMenuItems scrollTop which is set here.
      this.getChildView('simpleMenuItems').ensureActiveIsVisible();
      this._centerActive(this.model.get('listItemHeight'));

      this.$el.addClass('is-visible');
    },

    hide: function() {
      StreamusFG.channels.simpleMenu.vent.trigger('hidden');
      this.ui.panelContent.off('webkitTransitionEnd').one('webkitTransitionEnd', this._onTransitionOutComplete.bind(this));
      this.$el.removeClass('is-visible');
    },

    _onClickItem: function() {
      StreamusFG.channels.simpleMenu.vent.trigger('clicked:item');
      this.hide();
    },

    _onTransitionOutComplete: function() {
      this.destroy();
    },

    _onElementClick: function(event) {
      // These targets can show up when dragging the scrollbar and it's weird to close when interacting with scrollbar.
      if (event.target !== this.getRegion('simpleMenuItems').el) {
        this.hide();
      }
    },

    _onElementDrag: function() {
      this.hide();
    },

    // If a context menu click occurs and this menu is a context menu, hide it.
    _onElementContextMenu: function() {
      this.hide();
    },

    // Renders a SimpleMenuItem in a fixed location either above or below the collection of other items.
    _showFixedMenuItem: function(fixedMenuItem) {
      var fixedPosition = fixedMenuItem.get('fixedPosition');

      if (fixedPosition === FixedPosition.Top) {
        this.showChildView('fixedTopMenuItem', new SimpleMenuItemView({
          model: fixedMenuItem
        }));
      } else if (fixedPosition === FixedPosition.Bottom) {
        this.showChildView('fixedBottomMenuItem', new SimpleMenuItemView({
          model: fixedMenuItem
        }));
      }
    },

    _setPosition: function(positionData) {
      var offsetTop = utility.flipInvertOffset(positionData.top, this.$el.outerHeight(), positionData.containerHeight);
      var offsetLeft = utility.flipInvertOffset(positionData.left, this.$el.outerWidth(), positionData.containerWidth);

      // Be sure to round the values because sub-pixel positioning of view can cause blur.
      offsetTop = Math.round(offsetTop);
      offsetLeft = Math.round(offsetLeft);

      this.$el.css('transform', 'translate(' + offsetLeft + 'px, ' + offsetTop + 'px)');
      this.model.set({
        offsetTop: offsetTop,
        offsetLeft: offsetLeft
      });
    },

    // This needs to take into account overflow. If overflowing, abandon trying to center and keep within the viewport.
    // https://github.com/MeoMix/StreamusChromeExtension/issues/566
    // When showing this view over a ListItem, center the view's active item over the ListItem.
    _centerActive: function(listItemHeight) {
      if (listItemHeight > 0) {
        var offsetData = this.getChildView('simpleMenuItems').getActiveItemOffsetData();
        // Center the offset over the listItem using logic outlined in Material guidelines
        // http://www.google.com/design/spec/components/menus.html#menus-simple-menus
        var paddingTop = parseInt(this.ui.panelContent.css('padding-top'), 10);
        var centering = (listItemHeight - offsetData.itemHeight) / 2 - paddingTop;
        // Be sure to round because sub-pixel positioning can cause blur.
        var offsetTop = Math.round(offsetData.itemOffset + centering);

        this.$el.css('transform', 'translate(' + this.model.get('offsetLeft') + 'px, ' + offsetTop + 'px)');
        this.model.set('offsetTop:', offsetTop);
      }
    }
  });

  return SimpleMenuView;
});