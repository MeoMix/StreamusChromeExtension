define([
    'common/enum/listItemType',
    'foreground/view/behavior/collectionViewMultiSelect',
    'foreground/view/behavior/slidingRender',
    'foreground/view/behavior/sortable',
    'foreground/view/behavior/tooltip',
    'foreground/view/stream/streamItemView',
    'text!template/stream/streamItems.html'
], function (ListItemType, CollectionViewMultiSelect, SlidingRender, Sortable, Tooltip, StreamItemView, StreamItemsTemplate) {
    'use strict';

    var StreamItemsView = Marionette.CompositeView.extend({
        id: 'streamItems',
        className: 'column u-flex--column u-flex--full',
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
        
        ui: function () {
            return {
                emptyMessage: '#' + this.id + '-emptyMessage',
                //  TODO: If this was a CollectionView this wouldn't be an issue...
                //  NOTE: This has to be named generic for Sortable/SlidingRender behaviors. See issue here: https://github.com/marionettejs/backbone.marionette/issues/1909
                childContainer: '#' + this.id + '-listItems',
                showSearchLink: '#' + this.id + '-showSearchLink'
            };
        },
        
        events: {
            'click @ui.showSearchLink': '_onClickShowSearchLink'
        },
        //  TODO: I can't use _onCollectionAdd or _onCollectionRemove because they're reserved by Marionette: https://github.com/marionettejs/backbone.marionette/issues/2052
        collectionEvents: {
            'add': '_onStreamItemsAdd',
            'remove': '_onStreamItemsRemove',
            'reset': '_onStreamItemsReset'
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
        
        initialize: function () {
            this.listenTo(Streamus.channels.activeStreamItemArea.vent, 'beforeShow', this._onActiveStreamItemAreaBeforeShow);
            this.listenTo(Streamus.channels.activeStreamItemArea.vent, 'shown', this._onActiveStreamItemAreaShown);
            this.listenTo(Streamus.channels.activeStreamItemArea.vent, 'hidden', this._onActiveStreamItemAreaHidden);
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
        
        _onStreamItemsReset: function (collection) {
            this._setState(collection.isEmpty());
        },
        
        _onActiveStreamItemAreaBeforeShow: function () {
            setTimeout(function () {

                console.log('this.ui.childContainer height:', this.ui.childContainer.height(), this.$el.height());
                
                if (this.ui.childContainer.height() < this.$el.height()) {
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