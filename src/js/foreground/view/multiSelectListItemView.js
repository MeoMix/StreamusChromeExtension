define([
    'foreground/view/mixin/titleTooltip'
], function (TitleTooltip) {
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

        //  Usually lazy-load images, but if a option is given -- allow for instant loading.
        instant: false,

        templateHelpers: function () {

            console.log("Template helpers for ListItem:", this.model.get('songId'), this.model.get('song'));

            return {
                hdMessage: chrome.i18n.getMessage('hd'),
                instant: this.instant
            };
        },

        initialize: function (options) {
            this.instant = options && !_.isUndefined(options.instant) ? options.instant : this.instant;
        },

        setSelectedClass: function () {
            this.$el.toggleClass('selected', this.model.get('selected'));
        }

    }));

    return MultiSelectListItemView;
});