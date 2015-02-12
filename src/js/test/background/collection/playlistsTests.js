define(function (require) {
    'use strict';

    var Playlists = require('background/collection/playlists');
    var SyncActions = require('background/collection/syncActions');
    var Playlist = require('background/model/playlist');
    var SyncAction = require('background/model/syncAction');
    var SyncManager = require('background/model/syncManager');
    var SyncActionType = require('common/enum/listItemType');
    var ListItemType = require('test/testUtility');

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