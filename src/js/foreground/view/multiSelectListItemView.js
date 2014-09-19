define([
    'foreground/view/behavior/hoverButtons',
    'foreground/view/behavior/tooltip'
], function (HoverButtons, Tooltip) {
    'use strict';

    //  TODO: Make MultiSelect a Behavior instead of intrinsic.
    var MultiSelectListItemView = Backbone.Marionette.LayoutView.extend({
        className: 'listItem listItem--medium js-listItem--multiSelect',

        ui: {
            imageThumbnail: '.listItem-imageThumbnail',
            title: '.listItem-title',
            buttonsRegion: '.listItem-buttonsRegion',
            onActiveShown: '.is-shownOnActive'
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
            this.$el.toggleClass('is-selected', this.model.get('selected'));
        }
    });

    return MultiSelectListItemView;
});