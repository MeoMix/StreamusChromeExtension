﻿define(function (require) {
    'use strict';

    var ListItemType = require('common/enum/listItemType');
    var CollectionViewMultiSelect = require('foreground/view/behavior/collectionViewMultiSelect');
    var Scrollable = require('foreground/view/behavior/scrollable');
    var SlidingRender = require('foreground/view/behavior/slidingRender');
    var Sortable = require('foreground/view/behavior/sortable');
    var Tooltip = require('foreground/view/behavior/tooltip');
    var SearchResultView = require('foreground/view/search/searchResultView');
    var SearchResultsTemplate = require('text!template/search/searchResults.html');

    var SearchResultsView = Marionette.CompositeView.extend({
        id: 'searchResults',
        className: 'list u-flex--full',
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
            //SlidingRender: {
            //    behaviorClass: SlidingRender
            //},
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