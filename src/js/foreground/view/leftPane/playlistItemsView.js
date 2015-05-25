define(function(require) {
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
        childViewContainer: '@ui.listItems',
        childView: PlaylistItemView,
        childViewType: ListItemType.PlaylistItem,
        childViewOptions: function() {
            return {
                streamItems: Streamus.backgroundPage.stream.get('items'),
                player: Streamus.backgroundPage.player,
                type: this.childViewType,
                parentId: this.ui.listItems[0].id
            };
        },

        // Overwrite resortView to only render children as expected
        resortView: function() {
            this._renderChildren();
        },

        template: _.template(PlaylistItemsTemplate),

        ui: {
            listItems: '[data-ui~=listItems]'
        },

        behaviors: {
            CollectionViewMultiSelect: {
                behaviorClass: CollectionViewMultiSelect
            },
            Scrollable: {
                behaviorClass: Scrollable,
                implementsSlidingRender: true
            },
            SlidingRender: {
                behaviorClass: SlidingRender
            },
            Sortable: {
                behaviorClass: Sortable
            }
        },

        initialize: function() {
            this.listenTo(Streamus.channels.search.vent, 'showing', this._onSearchShowing);
        },

        // Don't maintain selected results after showing SearchView because this view won't be visible.
        _onSearchShowing: function() {
            this.triggerMethod('DeselectCollection');
        }
    });

    return PlaylistItemsView;
});