define([
    'foreground/view/listItemButtonsView',
    'foreground/view/mixin/titleTooltip'
], function (ListItemButtonsView, TitleTooltip) {
    'use strict';

    var MultiSelectListItemView = Backbone.Marionette.Layout.extend(_.extend({}, TitleTooltip, {
        className: 'list-item multi-select-item',

        ui: {
            imageThumbnail: '.item-thumb',
            title: '.item-title'
        },

        events: {
            'contextmenu': 'showContextMenu'
        },

        modelEvents: {
            'change:selected': 'setSelectedClass',
            'destroy': 'remove'
        },
        
        regions: {
            buttonsRegion: '.buttons-region'
        },

        //  Usually lazy-load images, but if a option is given -- allow for instant loading.
        instant: false,

        templateHelpers: function () {
            return {
                hdMessage: chrome.i18n.getMessage('hd'),
                instant: this.instant
            };
        },

        initialize: function (options) {
            this.instant = options && !_.isUndefined(options.instant) ? options.instant : this.instant;
        },
        
        onRender: function () {
            this.setSelectedClass();

            this.buttonsRegion.show(new ListItemButtonsView({
                model: this.model,
                buttonViews: this.buttonViews
            }));
        },

        setSelectedClass: function () {
            this.$el.toggleClass('selected', this.model.get('selected'));
        }

    }));

    return MultiSelectListItemView;
});