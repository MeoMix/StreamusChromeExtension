define([
    'background/enum/syncActionType',
    'common/enum/listItemType'
], function (SyncActionType, ListItemType) {
    'use strict';

    var SyncAction = Backbone.Model.extend({
        defaults: function () {
            return {
                listItemType: ListItemType.None,
                actionType: SyncActionType.None,
                model: null,
                //  Stays blank if no ActionType is not PropertyChanged
                property: '',
                //  TODO: Necessary? Doubt it, maybe want a diff model instead
                //  1+ ID of item which had an action applied
                //idListAffected: []
            };
        }
    });

    return SyncAction;
});