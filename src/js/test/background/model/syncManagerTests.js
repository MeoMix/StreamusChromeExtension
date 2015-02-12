define([
    'background/collection/syncActions',
    'background/enum/syncActionType',
    'background/model/syncManager',
    'background/model/playlist',
    'background/model/playlistItem',
    'common/enum/listItemType',
    'background/enum/songType'
], function (SyncActions, SyncActionType, SyncManager, Playlist, PlaylistItem, ListItemType, SongType) {
    'use strict';

    describe('SyncManager', function () {
        var PLAYLIST_ID = '1111';
        var PLAYLIST_TITLE = 'Playlist 0000';
        var PLAYLIST_ACTIVE = true;
        var PLAYLIST_SEQUENCE = 10000;

        var PLAYLIST_ITEM_ID = '2222';
        var PLAYLIST_ITEM_TITLE = 'Playlist Item 0000';
        var PLAYLIST_ITEM_SEQUENCE = 20000;

        var SONG_ID = 'ABCDEFGHIJK';
        var SONG_TITLE = 'Song 0000';
        var SONG_AUTHOR = 'John Doe';
        var SONG_DURATION = 999;
        var SONG_TYPE = SongType.YouTube;

        beforeEach(function () {
            sinon.stub(chrome.storage.sync, 'set').yields();
            SyncManager.get('syncActions').reset();
            
            this.playlist = new Playlist({
                id: PLAYLIST_ID,
                title: PLAYLIST_TITLE,
                active: PLAYLIST_ACTIVE,
                sequence: PLAYLIST_SEQUENCE
            });

            this.playlistItem = new PlaylistItem({
                id: PLAYLIST_ITEM_ID,
                playlistId: PLAYLIST_ID,
                title: PLAYLIST_ITEM_TITLE,
                sequence: PLAYLIST_ITEM_SEQUENCE,
                song: {
                    id: SONG_ID,
                    title: SONG_TITLE,
                    author: SONG_AUTHOR,
                    duration: SONG_DURATION,
                    type: SONG_TYPE
                }
            });
        });

        afterEach(function () {
            chrome.storage.sync.set.restore();
        });

        it('should respond to sync events', function () {
            sinon.spy(SyncManager, '_onSyncEvent');

            Streamus.channels.sync.vent.trigger('sync', {});
            expect(SyncManager._onSyncEvent.calledOnce).to.equal(true);
            expect(SyncManager.get('syncActions').length).to.equal(1);
            
            SyncManager._onSyncEvent.restore();
        });

        it('should be able to add Playlist - Added sync data to sync actions', function() {
            SyncManager._onSyncEvent({
                listItemType: ListItemType.Playlist,
                actionType: SyncActionType.Added,
                modelId: this.playlist.get('id'),
                modelAttributes: this.playlist.getSyncAttributes()
            });

            var syncAction = SyncManager.get('syncActions').at(0);
            expect(syncAction.get('listItemType')).to.equal(ListItemType.Playlist);
            expect(syncAction.get('actionType')).to.equal(SyncActionType.Added);
            expect(syncAction.get('modelId')).to.equal(PLAYLIST_ID);

            var modelAttributes = syncAction.get('modelAttributes');
            expect(modelAttributes.title).to.equal(PLAYLIST_TITLE);
            expect(modelAttributes.active).to.equal(PLAYLIST_ACTIVE);
            expect(modelAttributes.sequence).to.equal(PLAYLIST_SEQUENCE);
        });
        
        it('should be able to add Playlist - Removed sync data to sync actions', function () {
            SyncManager._onSyncEvent({
                listItemType: ListItemType.Playlist,
                actionType: SyncActionType.Removed,
                modelId: this.playlist.get('id')
            });

            var syncAction = SyncManager.get('syncActions').at(0);
            expect(syncAction.get('actionType')).to.equal(SyncActionType.Removed);
            expect(syncAction.get('modelId')).to.equal(PLAYLIST_ID);
        });
        
        it('should be able to add Playlist - Updated:Sequence sync data to sync actions', function () {
            SyncManager._onSyncEvent({
                listItemType: ListItemType.Playlist,
                actionType: SyncActionType.Updated,
                modelId: this.playlist.get('id'),
                property: {
                    name: 'sequence',
                    value: PLAYLIST_SEQUENCE
                }
            });

            var syncAction = SyncManager.get('syncActions').at(0);
            expect(syncAction.get('actionType')).to.equal(SyncActionType.Updated);
            expect(syncAction.get('modelId')).to.equal(PLAYLIST_ID);

            var property = syncAction.get('property');
            expect(property.name).to.equal('sequence');
            expect(property.value).to.equal(PLAYLIST_SEQUENCE);
        });
        
        it('should be able to add PlaylistItem - Added sync data to sync actions', function () {
            SyncManager._onSyncEvent({
                listItemType: ListItemType.PlaylistItem,
                actionType: SyncActionType.Added,
                modelId: this.playlistItem.get('id'),
                modelParentId: this.playlistItem.get('playlistId'),
                modelAttributes: this.playlistItem.getSyncAttributes()
            });

            var syncAction = SyncManager.get('syncActions').at(0);
            expect(syncAction.get('listItemType')).to.equal(ListItemType.PlaylistItem);
            expect(syncAction.get('actionType')).to.equal(SyncActionType.Added);
            expect(syncAction.get('modelId')).to.equal(PLAYLIST_ITEM_ID);
            expect(syncAction.get('modelParentId')).to.equal(PLAYLIST_ID);

            var modelAttributes = syncAction.get('modelAttributes');
            expect(modelAttributes.title).to.equal(PLAYLIST_ITEM_TITLE);
            expect(modelAttributes.sequence).to.equal(PLAYLIST_ITEM_SEQUENCE);
            
            //  These are stored outside of modelAttributes and shouldn't be sent twice.
            expect(modelAttributes.id).to.equal(undefined);
            expect(modelAttributes.playlistId).to.equal(undefined);
            
            //  These aren't necessary to send across because only need to be stored locally.
            expect(modelAttributes.selected).to.equal(undefined);
            expect(modelAttributes.firstSelected).to.equal(undefined);

            var song = modelAttributes.song;
            expect(song.title).to.equal(SONG_TITLE);
            expect(song.id).to.equal(SONG_ID);
            expect(song.author).to.equal(SONG_AUTHOR);
            expect(song.duration).to.equal(SONG_DURATION);
            expect(song.type).to.equal(SONG_TYPE);
            //  These are derivable so shouldn't be synced.
            expect(song.prettyDuration).to.equal(undefined);
            expect(song.url).to.equal(undefined);
            expect(song.cleanTitle).to.equal(undefined);
        });
        
        it('should be able to add PlaylistItem - Removed sync data to sync actions', function () {
            SyncManager._onSyncEvent({
                listItemType: ListItemType.PlaylistItem,
                actionType: SyncActionType.Removed,
                modelId: this.playlistItem.get('id'),
                modelParentId: this.playlistItem.get('playlistId')
            });

            var syncAction = SyncManager.get('syncActions').at(0);
            expect(syncAction.get('actionType')).to.equal(SyncActionType.Removed);
            expect(syncAction.get('modelId')).to.equal(PLAYLIST_ITEM_ID);
            expect(syncAction.get('modelParentId')).to.equal(PLAYLIST_ID);
        });
        
        it('should be able to add PlaylistItem - Updated:Sequence sync data to sync actions', function () {
            SyncManager._onSyncEvent({
                listItemType: ListItemType.PlaylistItem,
                actionType: SyncActionType.Updated,
                modelId: this.playlistItem.get('id'),
                modelParentId: this.playlistItem.get('playlistId'),
                property: {
                    name: 'sequence',
                    value: PLAYLIST_ITEM_SEQUENCE
                }
            });

            var syncAction = SyncManager.get('syncActions').at(0);
            expect(syncAction.get('actionType')).to.equal(SyncActionType.Updated);
            expect(syncAction.get('modelId')).to.equal(PLAYLIST_ITEM_ID);
            expect(syncAction.get('modelParentId')).to.equal(PLAYLIST_ID);

            var property = syncAction.get('property');
            expect(property.name).to.equal('sequence');
            expect(property.value).to.equal(PLAYLIST_ITEM_SEQUENCE);
        });

        it('should be able to turn syncActions into valid data for chrome.storage.sync writing', function() {
            SyncManager._onSyncEvent({
                listItemType: ListItemType.PlaylistItem,
                actionType: SyncActionType.Added,
                modelId: this.playlistItem.get('id'),
                modelParentId: this.playlistItem.get('playlistId'),
                modelAttributes: this.playlistItem.getSyncAttributes()
            });

            var writeableSyncActions = SyncManager._getWriteableSyncActions();
            expect(writeableSyncActions).not.to.equal(null);

            var syncAction = SyncManager.get('syncActions').at(0);
            expect(writeableSyncActions[syncAction.cid]).to.equal(JSON.stringify(syncAction));
        });

        it('should be able to write sync data to chrome.storage.sync', function () {
            sinon.spy(SyncManager, '_onChromeStorageSyncSet');

            SyncManager._onSyncEvent({
                listItemType: ListItemType.PlaylistItem,
                actionType: SyncActionType.Added,
                modelId: this.playlistItem.get('id'),
                modelParentId: this.playlistItem.get('playlistId'),
                modelAttributes: this.playlistItem.getSyncAttributes()
            });

            SyncManager._writeSyncActions();

            expect(chrome.storage.sync.set.calledOnce).to.equal(true);
            expect(SyncManager._onChromeStorageSyncSet.calledOnce).to.equal(true);
            expect(SyncManager.get('syncActions').length).to.equal(0);

            SyncManager._onChromeStorageSyncSet.restore();
        });

        it('should be able to determine an OK time to write sync data', function () {
            sinon.spy(SyncManager, '_onSyncActionAdded');

            SyncManager._onSyncEvent({
                listItemType: ListItemType.PlaylistItem,
                actionType: SyncActionType.Added,
                modelId: this.playlistItem.get('id'),
                modelParentId: this.playlistItem.get('playlistId'),
                modelAttributes: this.playlistItem.getSyncAttributes()
            });
            
            expect(SyncManager._onSyncActionAdded.calledOnce).to.equal(true);
            expect(SyncManager.get('syncWriteTimeout')).not.to.equal(null);

            SyncManager._onSyncActionAdded.restore();
        });

        it('should clean up properly after sync write timeout has exceeded', function() {
            SyncManager._setSyncWriteTimeout();
            SyncManager._clearSyncWriteTimeout();
            expect(SyncManager.get('syncWriteTimeout')).to.equal(null);
        });

        it('should be able to parse changes written to chrome.storage.sync', function () {
            sinon.spy(SyncManager, '_parseSyncChanges');

            var changes = {
                c18: {
                    newValue: '{"listItemType":1,"actionType":2,"modelId":1,"modelAttributes":{},"modelParentId":"","property":{"name":"","value":null}}'
                },
                c19: {
                    newValue: '{"listItemType":1,"actionType":3,"modelId":2,"modelAttributes":{},"modelParentId":"","property":{"name":"","value":null}}'
                },
                c20: {
                    oldValue: '{"listItemType":1,"actionType":3,"modelId":2,"modelAttributes":{},"modelParentId":"","property":{"name":"","value":null}}'
                }
            };

            SyncManager._onChromeStorageChanged(changes, 'sync');
            
            SyncManager._parseSyncChanges.restore();
        });

        it('should emit through radio channels when emitSyncActions is called', function () {
            var listItemType = ListItemType.PlaylistItem;
            var syncEventChannel = SyncManager._getSyncEventChannel(listItemType);

            sinon.stub(syncEventChannel, 'trigger');

            var syncActions = new SyncActions({
                listItemType: listItemType,
                actionType: SyncActionType.Added,
                modelId: this.playlistItem.get('id'),
                modelParentId: this.playlistItem.get('playlistId'),
                modelAttributes: this.playlistItem.getSyncAttributes()
            });

            SyncManager._emitSyncActions(syncActions);
            expect(syncEventChannel.trigger.calledOnce).to.equal(true);

            syncEventChannel.trigger.restore();
        });

        xit('should be able to provide access to sync data from chrome.storage.sync', function() {

        });

        xit('should emit events when chrome.storage.sync has been modified', function() {

        });
    });
});