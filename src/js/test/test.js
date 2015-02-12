define(function (require) {
    'use strict';

    var DialogTestModule = require('test/foreground/view/dialog/dialogTestModule');
    var ClientErrorManagerTest = require('test/background/model/clientErrorManagerTest');
    var PlaylistsTests = require('test/background/collection/playlistsTests');
    //var SyncManagerTests = require('test/background/model/syncManagerTests');
    var UserTests = require('test/background/model/userTests');
    var SignInManagerTests = require('test/background/model/signInManagerTests');
    var PlaylistItemsTests = require('test/background/model/playlistItemsTests');
    var PlaylistItemTests = require('test/background/model/playlistItemTests');
    var RelatedSongsManagerTests = require('test/background/model/relatedSongsManagerTests');
    var DataSourceTests = require('test/background/model/dataSourceTests');
    var UtilityTests = require('test/common/model/utilityTests');
    var YouTubeV3APITests = require('test/background/model/youTubeV3APITests');
});