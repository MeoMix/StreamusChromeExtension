define([
    'common/utility',
    'common/enum/exportFileType',
    'foreground/collection/radioGroups',
    'foreground/view/element/radioGroupView',
    'foreground/view/dialog/dialogContentView',
    'text!template/dialog/exportPlaylist.html'
], function (Utility, ExportFileType, RadioGroups, RadioGroupView, DialogContentView, ExportPlaylistTemplate) {
    'use strict';

    var ExportPlaylistView = DialogContentView.extend({
        id: 'exportPlaylist',
        template: _.template(ExportPlaylistTemplate),
        
        templateHelpers: {
            fileTypeMessage: chrome.i18n.getMessage('fileType'),
            csvMessage: chrome.i18n.getMessage('csv'),
            jsonMessage: chrome.i18n.getMessage('json')
        },
        
        regions: function () {
            return {
                fileTypeRegion: '#' + this.id + '-fileTypeRegion'
            };
        },
        
        ui: function() {
            return {
                exportCsvRadio: '#' + this.id + '-exportCsvRadio',
                exportJsonRadio: '#' + this.id + '-exportJsonRadio'
            };
        },
        
        radioGroups: null,

        initialize: function () {
            this.radioGroups = new RadioGroups();
        },
        
        onShow: function () {
            this._showRadioGroup('fileType', ExportFileType);
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
        
        _save: function() {
            var currentValues = {};

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
        
        _mapAsExportedItem: function (item) {
            var song = item.get('song');

            var exportedItem = {
                //  TODO: Maybe just get item title instead so when renaming is supported I return renamed value rather than initial? Or both?
                title: song.get('title'),
                id: song.get('id'),
                url: song.get('url'),
                author: song.get('author'),
                duration: song.get('duration'),
                prettyDuration: song.get('prettyDuration')
            };

            return exportedItem;
        },
        
        _getFileName: function () {
            var fileName = this.model.get('playlist').get('title');
            fileName += this._isExportingAsJson() ? '.json' : '.txt';
            return fileName;
        },
        
        _getMimeType: function () {
            return this._isExportingAsJson() ? 'application/json' : 'text/plain';
        },

        _isExportingAsJson: function () {
            return this.radioGroups.getByProperty('fileType').getCheckedValue() === ExportFileType.Json;
        },
        
        _isExportingAsCsv: function() {
            return this.radioGroups.getByProperty('fileType').getCheckedValue() === ExportFileType.Csv;
        }
    });

    return ExportPlaylistView;
});