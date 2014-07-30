define([
    'foreground/view/listItemButtonsView',
    'foreground/view/behavior/tooltip'
], function (ListItemButtonsView, Tooltip) {
    'use strict';

    var MultiSelectListItemView = Backbone.Marionette.LayoutView.extend({
        className: 'list-item multi-select-item sliding-view-item',

        ui: {
            imageThumbnail: '.item-thumb',
            title: '.item-title'
        },

        events: {
            'contextmenu': '_showContextMenu'
        },

        modelEvents: {
            'change:selected': '_setSelectedClass'
        },
        
        regions: {
            buttonsRegion: '.buttons-region'
        },
        
        behaviors: {
            Tooltip: {
                behaviorClass: Tooltip
            }
        },

        templateHelpers: function () {
            return {
                hdMessage: chrome.i18n.getMessage('hd')
            };
        },
        
        onRender: function () {
            this._setSelectedClass();

            this.buttonsRegion.show(new ListItemButtonsView({
                model: this.model,
                buttonViews: this.buttonViews
            }));
        },

        _setSelectedClass: function () {
            this.$el.toggleClass('selected', this.model.get('selected'));
        }
    });

    return MultiSelectListItemView;
});