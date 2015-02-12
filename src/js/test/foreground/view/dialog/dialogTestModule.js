define(function (require) {
    'use strict';
    
    //  Load all of the Dialog tests in one module so they can be disabled as a whole if need be.
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
    var DialogRegionTest = require('test/foreground/view/dialog/dialogRegionTest');
    var DialogViewTest = require('test/foreground/view/dialog/dialogViewTest');
    var SettingsDialogViewTest = require('test/foreground/view/dialog/settingsDialogViewTest');
    var SettingsViewTest = require('test/foreground/view/dialog/settingsViewTest');
    var UpdateStreamusDialogViewTest = require('test/foreground/view/dialog/updateStreamusDialogViewTest');
});