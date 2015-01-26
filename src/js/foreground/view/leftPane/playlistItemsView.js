define(function (require) {
    'use strict';

    var ListItemType = require('common/enum/listItemType');
    var CollectionViewMultiSelect = require('foreground/view/behavior/collectionViewMultiSelect');
    var Scrollable = require('foreground/view/behavior/scrollable');
    var SlidingRender = require('foreground/view/behavior/slidingRender');
    var Sortable = require('foreground/view/behavior/sortable');
    var PlaylistItemView = require('foreground/view/leftPane/playlistItemView');
    var PlaylistItemsTemplate = require('text!template/leftPane/playlistItems.html');

    var PlaylistItemsView = Marionette.CompositeView.extend({
        id: 'playlistItems',
        className: 'list u-flex--full',
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
            }
        }
    });

    return PlaylistItemsView;
});