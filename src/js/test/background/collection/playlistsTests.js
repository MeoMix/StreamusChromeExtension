define([
    'background/collection/playlists',
    'background/collection/syncActions',
    'background/model/playlist',
    'background/model/syncAction',
    'background/model/syncManager',
    'common/enum/listItemType',
    'test/testUtility'
], function (Playlists, SyncActions, Playlist, SyncAction, SyncManager, SyncActionType, ListItemType) {
    'use strict';

    describe('Playlists', function () {
        var PLAYLIST_TITLE = 'Playlist 0000';
        var PLAYLIST_ID = '1111';

        xit('should respond to emited SyncManager events', function() {
            var listItemType = ListItemType.Playlist;
            var syncEventChannel = SyncManager._getSyncEventChannel(listItemType);

            var playlist = new Playlist({
                title: PLAYLIST_TITLE,
                id: PLAYLIST_ID
            });

            SyncManager._emitSyncActions(new SyncActions({
                listItemType: listItemType,
                actionType: SyncActionType.Added,
                modelId: playlist.get('id'),
                modelAttributes: playlist.getSyncAttributes()
            }));
        });

        xit('should not emit a second sync event when adding a playlist via sync', function() {
            sinon.spy(Playlists, '_emitSyncAddEvent');
            sinon.spy(Playlists, '_onAdd');

            var listItemType = ListItemType.Playlist;

            var playlist = new Playlist({
                title: PLAYLIST_TITLE,
                id: PLAYLIST_ID
            });

            Playlists._addBySyncAction(new SyncAction({
                listItemType: listItemType,
                actionType: SyncActionType.Added,
                modelId: playlist.get('id'),
                modelAttributes: playlist.getSyncAttributes()
            }));

            expect(Playlists._emitSyncAddEvent.called).to.equal(false);
            expect(Playlists._onAdd.calledOnce).to.equal(true);

            Playlists._emitSyncAddEvent.restore();
        });
    });
});