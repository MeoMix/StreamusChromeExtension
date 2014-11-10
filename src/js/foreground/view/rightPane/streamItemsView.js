define([
    'common/enum/listItemType',
    'foreground/view/behavior/collectionViewMultiSelect',
    'foreground/view/behavior/slidingRender',
    'foreground/view/behavior/sortable',
    'foreground/view/behavior/tooltip',
    'foreground/view/rightPane/streamItemView',
    'text!template/rightPane/streamItems.html'
], function (ListItemType, CollectionViewMultiSelect, SlidingRender, Sortable, Tooltip, StreamItemView, StreamItemsTemplate) {
    'use strict';

    //  TODO: Implement an EmptyView?
    var StreamItemsView = Backbone.Marionette.CompositeView.extend({
        id: 'streamItems',
        className: 'column u-flex--full u-flex--column',
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
        templateHelpers: {
            emptyMessage: chrome.i18n.getMessage('streamEmpty'),
            searchForSongsMessage: chrome.i18n.getMessage('searchForSongs'),
            whyNotAddASongFromAPlaylistOrMessage: chrome.i18n.getMessage('whyNotAddASongFromAPlaylistOr')
        },
        
        ui: {
            emptyMessage: '#streamItems-emptyMessage',
            //  TODO: If this was a CollectionView this wouldn't be an issue...
            //  NOTE: This has to be named generic for Sortable/SlidingRender behaviors. See issue here: https://github.com/marionettejs/backbone.marionette/issues/1909
            childContainer: '#streamItems-listItems',
            showSearchLink: '#streamItems-showSearchLink'
        },
        
        events: {
            'click @ui.showSearchLink': '_onClickShowSearchLink'
        },
        //  TODO: I can't use _onCollectionAdd or _onCollectionRemove because they're reserved by Marionette: https://github.com/marionettejs/backbone.marionette/issues/2052
        collectionEvents: {
            'add': '_onStreamItemsAdd',
            'remove': '_onStreamItemsRemove',
            'reset': '_onStreamItemsnReset'
        },
        
        behaviors: {
            CollectionViewMultiSelect: {
                behaviorClass: CollectionViewMultiSelect
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
        
        onRender: function () {
            this._setState(this.collection.isEmpty());
        },
        
        _onClickShowSearchLink: function() {
            this._showSearch();
        },
        
        _onStreamItemsAdd: function () {
            this._setState(false);
        },
        
        _onStreamItemsRemove: function (model, collection) {
            this._setState(collection.isEmpty());
        },
        
        _onStreamItemsnReset: function (collection) {
            this._setState(collection.isEmpty());
        },
        
        //  Hide the empty message if there is anything in the collection
        _setState: function(collectionEmpty) {
            this.ui.emptyMessage.toggleClass('hidden', !collectionEmpty);
        },
        
        _showSearch: function () {
            Streamus.channels.searchArea.commands.trigger('show:search');
        }
    });

    return StreamItemsView;
})