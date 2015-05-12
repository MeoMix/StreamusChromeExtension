define(function(require) {
    'use strict';

    var Checkboxes = require('foreground/collection/checkboxes');
    var CheckboxView = require('foreground/view/element/checkboxView');
    var DialogContentView = require('foreground/view/dialog/dialogContentView');
    var BrowserSettingsTemplate = require('text!template/dialog/browserSettings.html');

    var BrowserSettingsView = DialogContentView.extend({
        id: 'browserSettings',
        template: _.template(BrowserSettingsTemplate),

        templateHelpers: {
            contextMenusMessage: chrome.i18n.getMessage('contextMenus'),
            websiteEnhancementsMessage: chrome.i18n.getMessage('websiteEnhancements')
        },

        regions: function() {
            return {
                showTextSelectionContextMenuRegion: '#' + this.id + '-showTextSelectionContextMenuRegion',
                showYouTubeLinkContextMenuRegion: '#' + this.id + '-showYouTubeLinkContextMenuRegion',
                showYouTubePageContextMenuRegion: '#' + this.id + '-showYouTubePageContextMenuRegion',
                enhanceYouTubeRegion: '#' + this.id + '-enhanceYouTubeRegion',
                enhanceBeatportRegion: '#' + this.id + '-enhanceBeatportRegion',
            };
        },

        initialize: function() {
            this.checkboxes = new Checkboxes();
        },

        save: function() {
            var currentValues = {};

            this.checkboxes.each(function(checkbox) {
                currentValues[checkbox.get('property')] = checkbox.get('checked');
            });

            this.model.save(currentValues);
        },

        onRender: function() {
            this._showCheckbox('showTextSelectionContextMenu', 'textSelection');
            this._showCheckbox('showYouTubeLinkContextMenu', 'youTubeLinks');
            this._showCheckbox('showYouTubePageContextMenu', 'youTubePages');
            this._showCheckbox('enhanceYouTube', 'youTube');
            this._showCheckbox('enhanceBeatport', 'beatport');
        },

        _showCheckbox: function(propertyName, message) {
            var checkbox = this.checkboxes.add({
                labelText: chrome.i18n.getMessage(message),
                checked: this.model.get(propertyName),
                property: propertyName
            });

            this[propertyName + 'Region'].show(new CheckboxView({
                model: checkbox
            }));
        }
    });

    return BrowserSettingsView;
});