define([
    'common/enum/youTubeSuggestedQuality',
    'foreground/collection/checkboxes',
    'foreground/view/element/checkboxView',
    'text!template/prompt/settings.html'
], function (YouTubeSuggestedQuality, Checkboxes, CheckboxView, SettingsTemplate) {
    'use strict';

    var SettingsView = Marionette.LayoutView.extend({
        id: 'settings',
        className: 'u-noWrap',
        template: _.template(SettingsTemplate),
        
        templateHelpers: {
            generalMessage: chrome.i18n.getMessage('general'),
            songQualityMessage: chrome.i18n.getMessage('songQuality'),
            highestMessage: chrome.i18n.getMessage('highest'),
            autoMessage: chrome.i18n.getMessage('auto'),
            lowestMessage: chrome.i18n.getMessage('lowest'),
            remindersMessage: chrome.i18n.getMessage('reminders'),
            YouTubeSuggestedQuality: YouTubeSuggestedQuality
        },
        
        regions: function () {
            return {
                showTooltipsRegion: '#' + this.id + '-showTooltipsRegion',
                openToSearchRegion: '#' + this.id + '-openToSearchRegion',
                openInTabRegion: '#' + this.id + '-openInTabRegion',
                remindClearStreamRegion: '#' + this.id + '-remindClearStreamRegion',
                remindDeletePlaylistRegion: '#' + this.id + '-remindDeletePlaylistRegion',
                remindLinkAccountRegion: '#' + this.id + '-remindLinkAccountRegion',
                remindGoogleSignInRegion: '#' + this.id + '-remindGoogleSignInRegion',
            };
        },
        
        ui: function () {
            return {
                checkboxes: 'input[type=checkbox]',
                selects: 'select',
            
                //  TODO: Naming length
                youTubeSuggestedQualitySelect: '#' + this.id + '-youTubeSuggestedQualitySelect'         
            };
        },
        
        checkboxes: null,
        
        initialize: function() {
            this.checkboxes = new Checkboxes();
        },
        
        onShow: function () {
            //  TODO: It would be sweet to render some CollectionViews which are able to render radios, selects or checkboxes... but not just yet.
            this._showCheckbox('showTooltips');
            this._showCheckbox('openToSearch');
            this._showCheckbox('openInTab');
            this._showCheckbox('remindClearStream');
            this._showCheckbox('remindDeletePlaylist');
            this._showCheckbox('remindLinkAccount');
            this._showCheckbox('remindGoogleSignIn');
        },
        
        _showCheckbox: function (propertyName) {
            var checkbox = this.checkboxes.add({
                labelText: chrome.i18n.getMessage(propertyName),
                checked: this.model.get(propertyName),
                property: propertyName
            });

            this[propertyName + 'Region'].show(new CheckboxView({
                model: checkbox
            }));
        },
        
        save: function () {
            var currentValues = {
                youTubeSuggestedQuality: this.ui.youTubeSuggestedQualitySelect.val()
            };

            this.checkboxes.each(function (checkbox) {
                currentValues[checkbox.get('property')] = checkbox.get('checked');
            });

            this.model.save(currentValues);
        }
    });

    return SettingsView;
});