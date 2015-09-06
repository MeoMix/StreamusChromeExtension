import {LayoutView} from 'marionette';
import Utility from 'common/utility';
import ExportFileType from 'common/enum/exportFileType';
import RadioGroups from 'foreground/collection/element/radioGroups';
import RadioGroupView from 'foreground/view/element/radioGroupView';
import DialogContent from 'foreground/view/behavior/dialogContent';
import ExportPlaylistTemplate from 'template/dialog/exportPlaylist.html!text';

var ExportPlaylistView = LayoutView.extend({
  id: 'exportPlaylist',
  template: _.template(ExportPlaylistTemplate),

  templateHelpers: {
    fileTypeMessage: chrome.i18n.getMessage('fileType'),
    csvMessage: chrome.i18n.getMessage('csv'),
    jsonMessage: chrome.i18n.getMessage('json')
  },

  regions: {
    fileType: 'fileType'
  },

  behaviors: {
    DialogContent: {
      behaviorClass: DialogContent
    }
  },

  radioGroups: null,

  initialize: function() {
    this.radioGroups = new RadioGroups();
  },

  onRender: function() {
    this._showRadioGroup('fileType', ExportFileType);
  },

  saveAndExport: function() {
    this._save();
    this._export();
  },

  _showRadioGroup: function(propertyName, options) {
    var buttons = _.map(options, function(value, key) {
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

    this.showChildView(propertyName, new RadioGroupView({
      model: radioGroup,
      collection: radioGroup.get('buttons')
    }));
  },

  _save: function() {
    var currentValues = {};

    this.radioGroups.each(function(radioGroup) {
      currentValues[radioGroup.get('property')] = radioGroup.get('buttons').getChecked().get('value');
    });

    this.model.save(currentValues);
  },

  _export: function() {
    var downloadableElement = document.createElement('a');

    var mimeType = this._getMimeType();
    var encodedFileText = encodeURIComponent(this._getFileText());
    downloadableElement.setAttribute('href', 'data:' + mimeType + ';charset=utf-8,' + encodedFileText);

    var fileName = this._getFileName();
    downloadableElement.setAttribute('download', fileName);
    downloadableElement.click();

    StreamusFG.channels.notification.commands.trigger('show:notification', {
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
    var video = item.get('video');

    var exportedItem = {
      title: video.get('title'),
      id: video.get('id'),
      url: video.get('url'),
      author: video.get('author'),
      duration: video.get('duration'),
      prettyDuration: video.get('prettyDuration')
    };

    return exportedItem;
  },

  _getFileName: function() {
    var fileName = this.model.get('playlist').get('title');
    fileName += this._isExportingAsJson() ? '.json' : '.txt';
    return fileName;
  },

  _getMimeType: function() {
    return this._isExportingAsJson() ? 'application/json' : 'text/plain';
  },

  _isExportingAsJson: function() {
    return this.radioGroups.getByProperty('fileType').getCheckedValue() === ExportFileType.Json;
  },

  _isExportingAsCsv: function() {
    return this.radioGroups.getByProperty('fileType').getCheckedValue() === ExportFileType.Csv;
  }
});

export default ExportPlaylistView;