define(function(require) {
    'use strict';

    var DialogContentView = require('foreground/view/dialog/dialogContentView');
    var AboutStreamusTemplate = require('text!template/dialog/aboutStreamus.html');

    var AboutStreamusView = DialogContentView.extend({
        id: 'aboutStreamus',
        template: _.template(AboutStreamusTemplate),

        templateHelpers: {
            applicationDetails: chrome.app.getDetails(),
            applicationDetailsMessage: chrome.i18n.getMessage('applicationDetails'),
            openHomepageMessage: chrome.i18n.getMessage('openHomepage'),
            versionMessage: chrome.i18n.getMessage('version'),
            openPatchNotesMessage: chrome.i18n.getMessage('openPatchNotes')
        },

        ui: {
            openHomepage: '.openHomepage',
            openPatchNotes: '.openPatchNotes'
        },

        events: {
            'click @ui.openHomepage': '_onClickOpenHomepage',
            'click @ui.openPatchNotes': '_onClickOpenPatchNotes'
        },

        tabManager: null,

        initialize: function() {
            this.tabManager = Streamus.backgroundPage.tabManager;
        },

        _onClickOpenHomepage: function() {
            /* jshint camelcase: false */
            var homepageUrl = chrome.app.getDetails().homepage_url;
            /* jshint camelcase: true */
            this.tabManager.showWebsite(homepageUrl);
        },

        _onClickOpenPatchNotes: function() {
            this.tabManager.showWebsite('https://github.com/MeoMix/StreamusChromeExtension/releases');
        }
    });

    return AboutStreamusView;
});