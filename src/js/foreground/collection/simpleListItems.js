define(function (require) {
    'use strict';

    var SimpleListItem = require('foreground/model/simpleListItem');

    var SimpleListItems = BackboneForeground.Collection.extend({
        model: SimpleListItem
    });

    return SimpleListItems;
});