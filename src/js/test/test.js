define(function(require) {
    'use strict';

    //  TODO: It might be worth breaking these tests up into sub-modules which would allow me to pass jshint.
    /* jshint ignore:start */
    var ClientErrorManagerTest = require('test/background/model/clientErrorManagerTest');
    var UserTests = require('test/background/model/userTests');
    var SignInManagerTests = require('test/background/model/signInManagerTests');
    var PlaylistItemsTests = require('test/background/model/playlistItemsTests');
    var PlaylistItemTests = require('test/background/model/playlistItemTests');
    var RelatedSongsManagerTests = require('test/background/model/relatedSongsManagerTests');
    var DataSourceTests = require('test/background/model/dataSourceTests');
    var UtilityTests = require('test/common/model/utilityTests');
    var YouTubeV3APITests = require('test/background/model/youTubeV3APITests');

    var BrowserSettingsDialogViewTest = require('test/foreground/view/dialog/browserSettingsDialogViewTest');
    var BrowserSettingsViewTest = require('test/foreground/view/dialog/browserSettingsViewTest');
    var ClearStreamDialogViewTest = require('test/foreground/view/dialog/clearStreamDialogViewTest');
    var CreatePlaylistDialogViewTest = require('test/foreground/view/dialog/createPlaylistDialogViewTest');
    var CreatePlaylistViewTest = require('test/foreground/view/dialog/createPlaylistViewTest');
    var DeletePlaylistDialogViewTest = require('test/foreground/view/dialog/deletePlaylistDialogViewTest');
    var DeletePlaylistViewTest = require('test/foreground/view/dialog/deletePlaylistViewTest');
    var EditPlaylistDialogViewTest = require('test/foreground/view/dialog/editPlaylistDialogViewTest');
    var EditPlaylistViewTest = require('test/foreground/view/dialog/editPlaylistViewTest');
    var ErrorDialogViewTest = require('test/foreground/view/dialog/errorDialogViewTest');
    var ExportPlaylistDialogViewTest = require('test/foreground/view/dialog/exportPlaylistDialogViewTest');
    var ExportPlaylistViewTest = require('test/foreground/view/dialog/exportPlaylistViewTest');
    var GoogleSignInDialogViewTest = require('test/foreground/view/dialog/googleSignInDialogViewTest');
    var LinkUserIdDialogViewTest = require('test/foreground/view/dialog/linkUserIdDialogViewTest');
    var SettingsDialogViewTest = require('test/foreground/view/dialog/settingsDialogViewTest');
    var SettingsViewTest = require('test/foreground/view/dialog/settingsViewTest');
    var UpdateStreamusDialogViewTest = require('test/foreground/view/dialog/updateStreamusDialogViewTest');
    /* jshint ignore:end */
});