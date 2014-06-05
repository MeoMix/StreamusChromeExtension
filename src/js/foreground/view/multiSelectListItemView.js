define([
    'foreground/view/listItemButtonsView',
    'foreground/view/mixin/titleTooltip'
], function (ListItemButtonsView, TitleTooltip) {
    'use strict';

    var MultiSelectListItemView = Backbone.Marionette.Layout.extend(_.extend({}, TitleTooltip, {
        className: 'list-item multi-select-item sliding-view-item',

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

        templateHelpers: function () {
            return {
                hdMessage: chrome.i18n.getMessage('hd')
            };
        },
        
        onRender: function () {
            this.setSelectedClass();

            this.buttonsRegion.show(new ListItemButtonsView({
                model: this.model,
                buttonViews: this.buttonViews
            }));
        },
        
        onShow: function() {
            this.setTitleTooltip(this.ui.title);
        },

        setSelectedClass: function () {
            this.$el.toggleClass('selected', this.model.get('selected'));
        }
    }));

    return MultiSelectListItemView;
});