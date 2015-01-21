define(function (require) {
    'use strict';

    var SyncActionType = require('background/enum/syncActionType');
    var ListItemType = require('common/enum/listItemType');

    var SyncAction = Backbone.Model.extend({
        defaults: {
            listItemType: ListItemType.None,
            actionType: SyncActionType.None,

            modelId: '',
            //  Only defined if ListItemType is PlaylistItem
            modelParentId: '',
                
            //  Only defined if ActionType is Added
            modelAttributes: {   
            },
                
            //  Only defined if ActionType is Updated
            property: {
                name: '',
                value: null
            }
        }
    });

    return SyncAction;
});