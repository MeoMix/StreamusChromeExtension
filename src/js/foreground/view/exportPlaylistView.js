define([
    'common/model/utility',
    'text!template/exportPlaylist.html'
], function (Utility, ExportPlaylistTemplate) {
    'use strict';

    var ExportPlaylistView = Backbone.Marionette.ItemView.extend({
        id: 'exportPlaylist',
        template: _.template(ExportPlaylistTemplate),
        
        ui: {
            exportCsvRadio: '#exportPlaylist-exportCsvRadio',
            exportJsonRadio: '#exportPlaylist-exportJsonRadio',
            exportTitleCheckbox: '#exportPlaylist-exportTitleCheckbox',
            exportIdCheckbox: '#exportPlaylist-exportIdCheckbox',
            exportUrlCheckbox: '#exportPlaylist-exportUrlCheckbox',
            exportAuthorCheckbox: '#exportPlaylist-exportAuthorCheckbox',
            exportDurationCheckbox: '#exportPlaylist-exportDurationCheckbox',
            checkboxes: 'input[type=checkbox]',
            radios: 'input[type=radio]'
        },
        
        _doRenderedOk: function () {
            this._exportPlaylist();
            this._saveState();
        },
        
        //  Ensure at least one checkbox is checked
        _validateCheckboxes: function () {
            var valid = this._isAnyCheckboxChecked();
            return valid;
        },
        
        _exportPlaylist: function() {
            var downloadableElement = document.createElement('a');
            downloadableElement.setAttribute('href', 'data:' + this._getMimeType() + ';charset=utf-8,' + encodeURIComponent(this._getFileText()));
            downloadableElement.setAttribute('download', this._getFileName());
            downloadableElement.click();
        },
        
        _getFileText: function() {
            var fileText;

            var itemsToExport = this.model.get('playlist').get('items').map(this._mapAsExportedItem.bind(this));
            var json = JSON.stringify(itemsToExport);
            
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

            if (this._isTitleCheckboxChecked()) {
                exportedItem.title = song.get('title');
            }
            
            if (this._isIdCheckboxChecked()) {
                exportedItem.id = song.get('id');
            }
            
            if (this._isUrlCheckboxChecked()) {
                exportedItem.url = song.get('url');
            }
            
            if (this._isAuthorCheckboxChecked()) {
                exportedItem.author = song.get('author');
            }
            
            if (this._isDurationCheckboxChecked()) {
                //  Getting normal duration isn't very useful b/c it's all in seconds rather than human readable.
                exportedItem.duration = song.get('prettyDuration');
            }

            return exportedItem;
        },
        
        _getFileName: function() {
            var fileExtension = '.txt';
            
            if (this._isExportingAsJson()) {
                fileExtension = '.json';
            }

            return this.model.get('playlist').get('title') + fileExtension;
        },
        
        _getMimeType: function () {
            var mimeType = 'text/plain';
            
            if (this._isExportingAsJson()) {
                mimeType = 'application/json';
            }

            return mimeType;
        },
        
        _isAnyCheckboxChecked: function() {
            return this.ui.checkboxes.is(':checked');
        },
        
        _isTitleCheckboxChecked: function() {
            return this.ui.exportTitleCheckbox.is(':checked');
        },
        
        _isIdCheckboxChecked: function() {
            return this.ui.exportIdCheckbox.is(':checked');
        },
        
        _isUrlCheckboxChecked: function() {
            return this.ui.exportUrlCheckbox.is(':checked');
        },
        
        _isAuthorCheckboxChecked: function() {
            return this.ui.exportAuthorCheckbox.is(':checked');
        },
        
        _isDurationCheckboxChecked: function() {
            return this.ui.exportDurationCheckbox.is(':checked');
        },
        
        _isExportingAsJson: function() {
            return this.ui.exportJsonRadio.is(':checked');
        },
        
        _isExportingAsCsv: function() {
            return this.ui.exportCsvRadio.is(':checked');
        },
        
        //  Write the checked state of all radios and checkboxes to the model for saving to localStorage.
        _saveState: function () {
            var inputs = this.ui.checkboxes.add(this.ui.radios);
            var saveOptions = {};

            _.each(inputs, function (input) {
                var modelAttribute = $(input).data('model-attribute');
                saveOptions[modelAttribute] = input.checked;
            });

            this.model.save(saveOptions);
        }
    });

    return ExportPlaylistView;
});