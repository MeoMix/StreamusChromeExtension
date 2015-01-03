define([
    'foreground/model/simpleListItem'
], function (SimpleListItem) {
    'use strict';

    var SimpleListItems = Backbone.Collection.extend({
        model: SimpleListItem
    });

    return SimpleListItems;
});