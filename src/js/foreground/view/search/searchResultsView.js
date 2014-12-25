define([
    'common/enum/listItemType',
    'foreground/view/behavior/collectionViewMultiSelect',
    'foreground/view/behavior/scrollable',
    'foreground/view/behavior/slidingRender',
    'foreground/view/behavior/sortable',
    'foreground/view/behavior/tooltip',
    'foreground/view/search/searchResultView',
    'text!template/search/searchResults.html'
], function (ListItemType, CollectionViewMultiSelect, Scrollable, SlidingRender, Sortable, Tooltip, SearchResultView, SearchResultsTemplate) {
    'use strict';

    var SearchResultsView = Marionette.CompositeView.extend({
        id: 'searchResults',
        className: 'column u-flex--column u-flex--full',
        childViewContainer: '@ui.childContainer',
        childView: SearchResultView,
        childViewType: ListItemType.SearchResult,
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
        
        template: _.template(SearchResultsTemplate),

        ui: function () {
            return {
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
        }
    });

    return SearchResultsView;
});