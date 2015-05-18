define(function(require) {
    'use strict';

    var DialogContent = require('foreground/view/behavior/dialogContent');
    var AboutStreamusTemplate = require('text!template/dialog/aboutStreamus.html');

    var AboutStreamusView = Marionette.LayoutView.extend({
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
            openHomepage: '[data-ui~=openHomepage]',
            openPatchNotes: '[data-ui~=openPatchNotes]'
        },

        events: {
            'click @ui.openHomepage': '_onClickOpenHomepage',
            'click @ui.openPatchNotes': '_onClickOpenPatchNotes'
        },

        behaviors: {
            DialogContent: {
                behaviorClass: DialogContent
            }
        },

        tabManager: null,

        initialize: function(options) {
            this.tabManager = options.tabManager;
        },

        _onClickOpenHomepage: function() {
            //  jshint camelcase: false
            //  jscs:disable requireCamelCaseOrUpperCaseIdentifiers
            var homepageUrl = chrome.app.getDetails().homepage_url;
            //  jscs:enable requireCamelCaseOrUpperCaseIdentifiers
            //  jshint camelcase: true
            this.tabManager.showWebsite(homepageUrl);
        },

        _onClickOpenPatchNotes: function() {
            this.tabManager.showWebsite('https://github.com/MeoMix/StreamusChromeExtension/releases');
        }
    });

    return AboutStreamusView;
});