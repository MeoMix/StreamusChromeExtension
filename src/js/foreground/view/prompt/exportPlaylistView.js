define([
    'common/utility',
    'common/enum/exportFileType',
    'foreground/collection/checkboxes',
    'foreground/collection/radioGroups',
    'foreground/view/element/checkboxView',
    'foreground/view/element/radioGroupView',
    'text!template/prompt/exportPlaylist.html'
], function (Utility, ExportFileType, Checkboxes, RadioGroups, CheckboxView, RadioGroupView, ExportPlaylistTemplate) {
    'use strict';

    //  TODO: Prevent submitting when not exporting any data.
    var ExportPlaylistView = Marionette.LayoutView.extend({
        id: 'exportPlaylist',
        template: _.template(ExportPlaylistTemplate),
        
        templateHelpers: {
            fileTypeMessage: chrome.i18n.getMessage('fileType'),
            csvMessage: chrome.i18n.getMessage('csv'),
            jsonMessage: chrome.i18n.getMessage('json'),
            includeMessage: chrome.i18n.getMessage('include')
        },
        
        regions: function () {
            return {
                fileTypeRegion: '#' + this.id + '-fileTypeRegion',
                exportTitleRegion: '#' + this.id + '-exportTitleRegion',
                exportIdRegion: '#' + this.id + '-exportIdRegion',
                exportUrlRegion: '#' + this.id + '-exportUrlRegion',
                exportAuthorRegion: '#' + this.id + '-exportAuthorRegion',
                exportDurationRegion: '#' + this.id + '-exportDurationRegion'
            };
        },
        
        ui: function() {
            return {
                exportCsvRadio: '#' + this.id + '-exportCsvRadio',
                exportJsonRadio: '#' + this.id + '-exportJsonRadio'
            };
        },
        
        radioGroups: null,
        checkboxes: null,

        initialize: function () {
            this.radioGroups = new RadioGroups();
            this.checkboxes = new Checkboxes();
        },
        
        //  TODO: Save radio button state
        onShow: function () {
            //  TODO: It would be sweet to render some CollectionViews which are able to render radios, selects or checkboxes... but not just yet.
            this._showRadioGroup('fileType', ExportFileType);

            this._showCheckbox('exportTitle');
            this._showCheckbox('exportId');
            this._showCheckbox('exportUrl');
            this._showCheckbox('exportAuthor');
            this._showCheckbox('exportDuration');
        },
        
        saveAndExport: function () {
            this._save();
            this._export();
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
                labelText: chrome.i18n.getMessage(propertyName.replace('export', '')),
                checked: this.model.get(propertyName),
                //  TODO: Maybe I should rename this to propertyName since it's not a full property its just the key. (propertyKey?);
                property: propertyName
            });

            this[propertyName + 'Region'].show(new CheckboxView({
                model: checkbox
            }));
        },
        
        _save: function() {
            var currentValues = {};

            this.checkboxes.each(function (checkbox) {
                currentValues[checkbox.get('property')] = checkbox.get('checked');
            });

            this.radioGroups.each(function (radioGroup) {
                currentValues[radioGroup.get('property')] = radioGroup.get('buttons').getChecked().get('value');
            });

            this.model.save(currentValues);
        },
        
        _export: function() {
            var downloadableElement = document.createElement('a');
            downloadableElement.setAttribute('href', 'data:' + this._getMimeType() + ';charset=utf-8,' + encodeURIComponent(this._getFileText()));
            downloadableElement.setAttribute('download', this._getFileName());
            downloadableElement.click();

            Streamus.channels.notification.commands.trigger('show:notification', {
                message: chrome.i18n.getMessage('playlistExported')
            });
        },

        _getFileText: function() {
            var itemsToExport = this.model.get('playlist').get('items').map(this._mapAsExportedItem.bind(this));
            var json = JSON.stringify(itemsToExport);
            var fileText;
            
            if (this._isExportingAsCsv()) {
                fileText = Utility.jsonToCsv(json);
            } else {
                fileText = json;
            }

            return fileText;
        },
        
        _mapAsExportedItem: function(item) {
            var exportedItem = {};
            var song = item.get('song');

            if (this.checkboxes.isChecked('exportTitle')) {
                exportedItem.title = song.get('title');
            }
            
            if (this.checkboxes.isChecked('exportId')) {
                exportedItem.id = song.get('id');
            }
            
            if (this.checkboxes.isChecked('exportUrl')) {
                exportedItem.url = song.get('url');
            }
            
            if (this.checkboxes.isChecked('exportAuthor')) {
                exportedItem.author = song.get('author');
            }
            
            if (this.checkboxes.isChecked('exportDuration')) {
                //  Getting normal duration isn't very useful b/c it's all in seconds rather than human readable.
                exportedItem.duration = song.get('prettyDuration');
            }

            return exportedItem;
        },
        
        _getFileName: function () {
            var playlistTitle = this.model.get('playlist').get('title');
            return playlistTitle + this._isExportingAsJson() ? '.json' : '.txt';
        },
        
        _getMimeType: function () {
            return this._isExportingAsJson() ? 'application/json' : 'text/plain';
        },

        _isExportingAsJson: function() {
            return this.ui.exportJsonRadio.is(':checked');
        },
        
        _isExportingAsCsv: function() {
            return this.ui.exportCsvRadio.is(':checked');
        }
    });

    return ExportPlaylistView;
});