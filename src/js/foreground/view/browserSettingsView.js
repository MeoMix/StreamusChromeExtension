define([
    'text!template/browserSettings.html'
], function (BrowserSettingsTemplate) {
    'use strict';

    var BrowserSettingsView = Backbone.Marionette.ItemView.extend({
        id: 'browserSettings',
        className: 'u-noWrap',
        template: _.template(BrowserSettingsTemplate),
        
        templateHelpers: {
            contextMenusMessage: chrome.i18n.getMessage('contextMenus'),
            websiteEnhancementsMessage: chrome.i18n.getMessage('websiteEnhancements'),
            showOnTextSelectionMessage: chrome.i18n.getMessage('showOnTextSelection'),
            showOnYouTubeLinksMessage: chrome.i18n.getMessage('showOnYouTubeLinks'),
            showOnYouTubePagesMessage: chrome.i18n.getMessage('showOnYouTubePages'),
            applyToYouTubeMessage: chrome.i18n.getMessage('applyToYouTube'),
            applyToBeatportMessage: chrome.i18n.getMessage('applyToBeatport')
        },
        
        ui: {
            checkboxes: 'input[type=checkbox]'
        },
        
        events: {
            'change @ui.checkboxes': '_onCheckboxChange'
        },
        
        _onCheckboxChange: function(event) {
            var checkbox = $(event.target);
            var property = checkbox.data('property');
            var checked = checkbox.is(':checked');
            this.model.save(property, checked);
        }
    });

    return BrowserSettingsView;
});