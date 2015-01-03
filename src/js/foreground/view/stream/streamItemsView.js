define([
    'common/enum/listItemType',
    'foreground/view/behavior/collectionViewMultiSelect',
    'foreground/view/behavior/scrollable',
    'foreground/view/behavior/slidingRender',
    'foreground/view/behavior/sortable',
    'foreground/view/behavior/tooltip',
    'foreground/view/stream/streamItemView',
    'text!template/stream/streamItems.html'
], function (ListItemType, CollectionViewMultiSelect, Scrollable, SlidingRender, Sortable, Tooltip, StreamItemView, StreamItemsTemplate) {
    'use strict';

    var StreamItemsView = Marionette.CompositeView.extend({
        id: 'streamItems',
        className: 'list',
        childViewContainer: '@ui.childContainer',
        childView: StreamItemView,
        childViewType: ListItemType.StreamItem,
        childViewOptions: function () {
            return {
                type: this.childViewType,
                parentId: this.ui.childContainer[0].id
            };
        },

        //  Overwrite resortView to only render children as expected
        resortView: function () {
            this._renderChildren();
        },

        template: _.template(StreamItemsTemplate),

        ui: function () {
            return {
                //  TODO: This has to be named generic for Sortable/SlidingRender behaviors. See issue here: https://github.com/marionettejs/backbone.marionette/issues/1909
                childContainer: '#' + this.id + '-listItems'
            };
        },

        behaviors: {
            CollectionViewMultiSelect: {
                behaviorClass: CollectionViewMultiSelect
            },
            Scrollable: {
                behaviorClass: Scrollable
            },
            SlidingRender: {
                behaviorClass: SlidingRender
            },
            Sortable: {
                behaviorClass: Sortable
            },
            Tooltip: {
                behaviorClass: Tooltip
            }
        },

        initialize: function () {
            this.listenTo(Streamus.channels.activeStreamItemArea.vent, 'beforeShow', this._onActiveStreamItemAreaBeforeShow);
            this.listenTo(Streamus.channels.activeStreamItemArea.vent, 'shown', this._onActiveStreamItemAreaShown);
            this.listenTo(Streamus.channels.activeStreamItemArea.vent, 'hidden', this._onActiveStreamItemAreaHidden);
        },

        _onActiveStreamItemAreaBeforeShow: function () {
            //  TODO: Clean this up
            setTimeout(function () {
                if (this.ui.childContainer.height() <= this.$el.height()) {
                    this.ui.childContainer.addClass('is-heightRestricted');
                }
            }.bind(this));
        },

        _onActiveStreamItemAreaShown: function () {
            this.ui.childContainer.removeClass('is-heightRestricted');
            this.triggerMethod('ListHeightUpdated');
        },

        _onActiveStreamItemAreaHidden: function () {
            this.triggerMethod('ListHeightUpdated');
        }
    });

    return StreamItemsView;
});