define(function (require) {
    'use strict';

    var SimpleListItem = require('foreground/model/element/simpleListItem');

    var SimpleListItems = Backbone.Collection.extend({
        model: SimpleListItem
    });

    return SimpleListItems;
});