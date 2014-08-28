define([
    'background/collection/syncActions',
    'common/enum/listItemType'
], function (SyncActions, ListItemType) {
    'use strict';
    
    var SyncManager = Backbone.Model.extend({
        defaults: {
            //  TODO: What if they restart Streamus with queuedActions still available? Need to persist in local.
            syncActions: new SyncActions()
        },
        
        initialize: function () {
            //  I need to be able to detect all the different types of events happening in my program and queue up actions when they happen.
            this.listenTo(Backbone.Wreqr.radio.channel('sync').vent, 'sync', this._onSyncEvent);


            //  I need to group each type of action together before sending it through chrome.storage.sync.


            //chrome.storage.sync.onChanged.addListener(this._onChromeStorageSyncChanged.bind(this));
        },
        
        //  Take all the queued actions and sort them into grouped piles before writing to chrome.storage.sync
        _prepareActions: function() {
            //  Sort into piles for each listItemType.
            //  Do ListItemType.Playlist actions first to ensure that Playlists are created before attempting to add PlaylistItems to them.
            
            //  For each pile, sort into sub-piles by SyncActionType.
            //  Combine each sub-pile into one SyncAction.
        },
        
        _onSyncEvent: function (syncEventData) {
            console.log('onSyncEvent');
            this.get('syncActions').add(syncEventData);
        },
        
        _onChromeStorageSyncChanged: function(changes, areaName) {
            console.log("Changes:", changes);

            //Backbone.Wreqr.radio.channel('sync').trigger('')
        }
    });

    return new SyncManager();
});