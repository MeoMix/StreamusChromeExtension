define([
    'common/enum/listItemType',
    'foreground/view/behavior/collectionViewMultiSelect',
    'foreground/view/behavior/scrollable',
    'foreground/view/behavior/slidingRender',
    'foreground/view/behavior/sortable',
    'foreground/view/behavior/tooltip',
    'foreground/view/leftPane/playlistItemView',
    'text!template/leftPane/playlistItems.html'
], function (ListItemType, CollectionViewMultiSelect, Scrollable, SlidingRender, Sortable, Tooltip, PlaylistItemView, PlaylistItemsTemplate) {
    'use strict';

    var PlaylistItemsView = Marionette.CompositeView.extend({
        id: 'playlistItems',
        className: 'list',
        childViewContainer: '@ui.childContainer',
        childView: PlaylistItemView,
        childViewType: ListItemType.PlaylistItem, 
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
        
        template: _.template(PlaylistItemsTemplate),
        
        ui: function () {
            return {
                childContainer: '#' + this.id + '-listItems'
            };
        },

        behaviors: {
            CollectionViewMultiSelect: {
                behaviorClass: CollectionViewMultiSelect,
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
        }
    });

    return PlaylistItemsView;
});