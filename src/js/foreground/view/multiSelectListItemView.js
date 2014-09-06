define([
    'foreground/view/behavior/hoverButtons',
    'foreground/view/behavior/tooltip'
], function (HoverButtons, Tooltip) {
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
            buttonsRegion: '.region.list-item-buttons'
        },
        
        behaviors: {
            Tooltip: {
                behaviorClass: Tooltip
            },
            HoverButtons: {
                behaviorClass: HoverButtons
            }
        },

        templateHelpers: function () {
            return {
                hdMessage: chrome.i18n.getMessage('hd')
            };
        },
        
        onRender: function () {
            this._setSelectedClass();
        },

        _setSelectedClass: function () {
            this.$el.toggleClass('selected', this.model.get('selected'));
        }
    });

    return MultiSelectListItemView;
});