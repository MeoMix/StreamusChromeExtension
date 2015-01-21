define(function (require) {
    'use strict';

    var SyncAction = require('background/model/syncAction');

    var SyncActions = Backbone.Collection.extend({
        model: SyncAction
    });

    return SyncActions;
});