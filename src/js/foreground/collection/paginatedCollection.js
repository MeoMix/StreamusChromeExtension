define([
], function () {
    'use strict';

    var PaginatedCollection = Backbone.Collection.extend({
        model: null,
        comparator: null,

        fullCollection: null,
        
        startPage: 1,
        currentPage: -1,
        
        pageBuffer: 1,
        pageSize: 25,
        
        setCollection: function (collection) {
            this.fullCollection = collection;
            this.model = this.fullCollection.model;
            this.comparator = this.fullCollection.comparator;

            this.loadPage(this.startPage);
        },
        
        //  TODO: How should I unload a previous page of items?
        loadPage: function(page) {
            
            //  No need to load previous page into buffer if start page
            if (page === this.startPage) {
                var initialAmount = this.pageSize * (this.pageBuffer + 1);

                //  Load the first page of items as well as an additional page of items.
                this.reset(this.fullCollection.first(initialAmount));
            }

            this.currentPage = page;
        },
        
        loadNextPage: function () {
            //  When going to the next page, leave a trailing buffer of pageSize * pageBuffer
            var start = (this.currentPage - this.pageBuffer) * this.pageSize;
            var end = (this.currentPage + this.pageBuffer + 1) * this.pageSize;

            console.log("start/end", start, end);

            if (end > this.fullCollection.length) {
                end = this.fullCollection.length;
            }

            var subset = this.fullCollection.slice(start, end);
 
            this.reset(subset);
            this.currentPage += 1;
        },
        
        loadPreviousPage: function() {
            //  When going to the previous page, leave a trailing buffer of pageSize * pageBuffer
            var start = (this.currentPage - 1) * this.pageSize;
            if (start < 0) {
                start = 0;
            }

            var end = (this.currentPage + 1) * this.pageSize;

            this.reset(this.fullCollection.slice(start, end));
            this.currentPage -= 1;
        }
    });

    return PaginatedCollection;
});