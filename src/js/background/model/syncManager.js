define([
    'background/collection/syncActions',
    'common/enum/listItemType'
], function (SyncActions, ListItemType) {
    'use strict';

    //  60000ms = 1 minute
    var SYNC_WRITE_TIMEOUT_DELAY = 60000;
    
    var SyncManager = Backbone.Model.extend({
        defaults: {
            //  TODO: What if they restart Streamus with queuedActions still available? Need to persist in local.
            syncActions: new SyncActions(),
            syncWriteTimeout: null
        },
        
        initialize: function () {
            //  I need to be able to detect all the different types of events happening in my program and queue up actions when they happen.
            //this.listenTo(Backbone.Wreqr.radio.channel('sync').vent, 'sync', this._onSyncEvent);
            
            //  I need to group each type of action together before sending it through chrome.storage.sync.
            chrome.storage.onChanged.addListener(this._onChromeStorageChanged.bind(this));

            this.listenTo(this.get('syncActions'), 'add', this._onSyncActionAdded);
        },
        
        _getWriteableSyncActions: function() {
            var writeableSyncActions = {};

            this.get('syncActions').each(function (syncAction) {
                writeableSyncActions[syncAction.cid] = JSON.stringify(syncAction);
            });

            return writeableSyncActions;
        },
        
        _onSyncEvent: function (syncEventData) {
            this.get('syncActions').add(syncEventData);
        },
        
        _onChromeStorageChanged: function(changes, areaName) {
            console.log("Changes:", changes, areaName);
            
            if (areaName === 'sync') {
                var syncActions = this._parseSyncChanges(changes);
                this._emitSyncActions(syncActions);
            }
        },
        
        _parseSyncChanges: function (syncChanges) {
            var syncChangeValues = _.values(syncChanges);

            var jsonStringSyncActions = [];
            //  Only work upon "newValue" changes -- "oldValue" changes have been removed and don't need propagation anywhere.
            _.each(syncChangeValues, function(syncChangeValue) {
                var newValueJsonString = syncChangeValue["newValue"];
                
                if (!_.isUndefined(newValueJsonString)) {
                    jsonStringSyncActions.push(newValueJsonString);
                }
            });

            var syncActions = new SyncActions(_.map(jsonStringSyncActions, function (jsonStringSyncAction) {
                return JSON.parse(jsonStringSyncAction);
            }));

            return syncActions;
        },
        
        _emitSyncActions: function(syncActions) {
            console.log('syncActions:', syncActions);

            syncActions.each(function(syncAction) {
                Backbone.Wreqr.radio.channel('sync-' + syncAction.get('listItemType')).trigger(syncAction.get('actionType'), syncAction);  
            });

            //Backbone.Wreqr.radio.channel('sync').trigger('');  
        },
        
        _onSyncActionAdded: function() {
            this._clearSyncWriteTimeout();
            this._setSyncWriteTimeout();
        },
        
        _clearSyncWriteTimeout: function() {
            clearTimeout(this.get('syncWriteTimeout'));
            this.set('syncWriteTimeout', null);
        },
        
        _setSyncWriteTimeout: function() {
            this.set('syncWriteTimeout', setTimeout(this._onSyncWriteTimeoutExceeded.bind(this)), SYNC_WRITE_TIMEOUT_DELAY);
        },
        
        //  Whenever SyncWriteTimeout is exceeded - write SyncActions to chrome.storage.sync
        _onSyncWriteTimeoutExceeded: function() {
            this._writeSyncActions();
            this.set('syncWriteTimeout', null);
        },
        
        _writeSyncActions: function () {
            var writeableSyncActions = this._getWriteableSyncActions();
            chrome.storage.sync.set(writeableSyncActions, this._onChromeStorageSyncSet.bind(this));
        },
        
        _onChromeStorageSyncSet: function () {
            var error = chrome.runtime.lastError;
            if (error) {
                //  TODO: I might need to re-try saving sync actions or something?
                throw new Error(error);
            } else {
                console.log("Sync successful.");
                this.get('syncActions').reset();
            }
        }
    });

    return new SyncManager();
});