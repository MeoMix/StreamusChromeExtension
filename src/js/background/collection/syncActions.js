define([
    'background/model/syncAction'
], function (SyncAction) {
    'use strict';

    var SyncActions = Backbone.Collection.extend({
        model: SyncAction
    });

    return SyncActions;
});