define([
    'foreground/view/behavior/hoverButtons',
    'foreground/view/behavior/tooltip'
], function (HoverButtons, Tooltip) {
    'use strict';

    //  TODO: make MultiSelect a Behavior instead of intrinsic.
    var MultiSelectListItemView = Backbone.Marionette.LayoutView.extend({
        className: 'listItem base multi-select-item sliding-view-item',

        ui: {
            imageThumbnail: '.listItem-imageThumbnail',
            title: '.listItem-title',
            buttonsRegion: '.listItem-buttonsRegion',
            onActiveShown: '.onActive-shown'
        },

        events: {
            'contextmenu': '_showContextMenu'
        },

        modelEvents: {
            'change:selected': '_setSelectedClass'
        },
        
        regions: {
            buttonsRegion: '@ui.buttonsRegion'
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