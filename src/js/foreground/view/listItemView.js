define(function(require) {
    'use strict';

    var Tooltip = require('foreground/view/behavior/tooltip');
    var ListItemButtonsView = require('foreground/view/listItemButton/listItemButtonsView');

    var ListItemView = Marionette.LayoutView.extend({
        tagName: 'li',
        className: 'listItem',

        attributes: function() {
            //  Store the clientId on the view until the model has been saved successfully.
            var id = this.model.isNew() ? this.model.cid : this.model.get('id');

            return {
                'data-id': id,
                'data-type': this.options.type,
                //  When a view is unloaded by slidingRender logic it loses track of its parent. This is able to be used to get a reference to it.
                'data-parentid': this.options.parentId
            };
        },

        events: {
            'contextmenu': '_onContextMenu',
            'mouseenter': '_onMouseEnter',
            'mouseleave': '_onMouseLeave'
        },

        regions: function() {
            return {
                buttonsRegion: '.' + ListItemView.prototype.className + '-buttonsRegion',
                spinnerRegion: '.' + ListItemView.prototype.className + '-spinnerRegion',
                checkboxRegion: '.' + ListItemView.prototype.className + '-checkboxRegion'
            };
        },

        behaviors: {
            Tooltip: {
                behaviorClass: Tooltip
            }
        },

        _onContextMenu: function(event) {
            event.preventDefault();
            this.showContextMenu();
        },

        _onMouseEnter: function() {
            this.buttonsRegion.show(new ListItemButtonsView({
                model: this.model,
                buttonViews: this.buttonViews
            }));
        },

        _onMouseLeave: function() {
            this.buttonsRegion.empty();
        }
    });

    return ListItemView;
});