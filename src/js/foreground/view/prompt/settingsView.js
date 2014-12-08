define([
    'common/enum/songQuality',
    'foreground/collection/checkboxes',
    'foreground/collection/radioGroups',
    'foreground/view/element/checkboxView',
    'foreground/view/element/radioGroupView',
    'text!template/prompt/settings.html'
], function (SongQuality, Checkboxes, RadioGroups, CheckboxView, RadioGroupView, SettingsTemplate) {
    'use strict';

    var SettingsView = Marionette.LayoutView.extend({
        id: 'settings',
        className: 'u-noWrap',
        template: _.template(SettingsTemplate),
        
        templateHelpers: {
            generalMessage: chrome.i18n.getMessage('general'),
            songQualityMessage: chrome.i18n.getMessage('songQuality'),
            remindersMessage: chrome.i18n.getMessage('reminders')
        },
        
        regions: function () {
            return {
                //songQualityRegion: '#' + this.id + '-songQualityRegion',
                showTooltipsRegion: '#' + this.id + '-showTooltipsRegion',
                openToSearchRegion: '#' + this.id + '-openToSearchRegion',
                openInTabRegion: '#' + this.id + '-openInTabRegion',
                remindClearStreamRegion: '#' + this.id + '-remindClearStreamRegion',
                remindDeletePlaylistRegion: '#' + this.id + '-remindDeletePlaylistRegion',
                remindLinkAccountRegion: '#' + this.id + '-remindLinkAccountRegion',
                remindGoogleSignInRegion: '#' + this.id + '-remindGoogleSignInRegion',
            };
        },

        radioGroups: null,
        checkboxes: null,
        signInManager: null,
        
        initialize: function () {
            this.radioGroups = new RadioGroups();
            this.checkboxes = new Checkboxes();

            this.signInManager = Streamus.backgroundPage.signInManager;
        },
        
        onShow: function () {
            //  TODO: It would be sweet to render some CollectionViews which are able to render radios, selects or checkboxes... but not just yet.
            //this._showRadioGroup('songQuality', SongQuality);

            this._showCheckbox('showTooltips');
            this._showCheckbox('openToSearch');
            this._showCheckbox('openInTab');
            this._showCheckbox('remindClearStream');
            this._showCheckbox('remindDeletePlaylist');
            
            //  Once some states have been fulfilled there is no need to allow their reminders to be toggled because
            //  the prompts which correspond to the reminders will not be shown.
            if (this.signInManager.get('needLinkUserId')) {
                this._showCheckbox('remindLinkAccount');
            }

            if (this.signInManager.get('needGoogleSignIn')) {
                this._showCheckbox('remindGoogleSignIn');
            }
        },
        
        _showRadioGroup: function (propertyName, options) {
            var buttons = _.map(options, function (value, key) {
                return {
                    checked: this.model.get(propertyName) === value,
                    value: value,
                    labelText: chrome.i18n.getMessage(key)
                };
            }, this);

            var radioGroup = this.radioGroups.add({
                property: propertyName,
                buttons: buttons
            });

            this[propertyName + 'Region'].show(new RadioGroupView({
                model: radioGroup,
                collection: radioGroup.get('buttons')
            }));
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
            var currentValues = {};

            this.checkboxes.each(function (checkbox) {
                currentValues[checkbox.get('property')] = checkbox.get('checked');
            });
            
            this.radioGroups.each(function (radioGroup) {
                currentValues[radioGroup.get('property')] = radioGroup.get('buttons').getChecked().get('value');
            });

            this.model.save(currentValues);
        }
    });

    return SettingsView;
});