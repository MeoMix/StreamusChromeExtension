import _ from 'common/shim/lodash.reference.shim';
import {Collection, Model} from 'backbone';

var CollectionUniqueVideo = {
  initialize: function() {
    // Stub out the default implementation of add with one which enforces uniqueness based on video id.
    this.add = this._add;
  },

  getDuplicatesInfo: function(videos) {
    videos = videos instanceof Collection ? videos.models : _.isArray(videos) ? videos : [videos];

    var duplicates = _.filter(videos, this._hasVideo.bind(this));
    var allDuplicates = duplicates.length === videos.length;
    var someDuplicates = !allDuplicates && duplicates.length > 0;
    var message = '';

    var collectionName = this.userFriendlyName.toLowerCase();

    if (allDuplicates) {
      if (videos.length === 1) {
        message = chrome.i18n.getMessage('videoAlreadyInCollection', [collectionName]);
      } else {
        message = chrome.i18n.getMessage('allVideosAlreadyInCollection', [collectionName]);
      }
    } else if (someDuplicates) {
      message = chrome.i18n.getMessage('videosAlreadyInCollection', [duplicates.length, videos.length, collectionName]);
    }

    return {
      allDuplicates: allDuplicates,
      someDuplicates: someDuplicates,
      message: message
    };
  },

  // Prevent models from being added to the collection if the model's video is not unique to the collection.
  _add: function(models, options) {
    var preparedModels;

    if (models instanceof Collection) {
      preparedModels = models.map(this._prepareModelToAdd.bind(this));
    } else if (_.isArray(models)) {
      preparedModels = _.map(models, this._prepareModelToAdd.bind(this));
    } else if (!_.isNull(models) && !_.isUndefined(models)) {
      preparedModels = this._prepareModelToAdd(models);
    } else {
      preparedModels = models;
    }

    // Call the original add method using preparedModels which have updated their IDs to match any existing models.
    return Collection.prototype.add.call(this, preparedModels, options);
  },

  // NOTE: The function _prepareModel is reserved by Backbone.
  _prepareModelToAdd: function(model) {
    // If an existing model was not found then just use the given reference.
    var preparedModel = model;
    var existingModel = this._getExistingModel(model);

    // If an existing model was found then clone the given reference and update its id.
    if (!_.isUndefined(existingModel)) {
      preparedModel = this._clone(model);
      this._copyId(preparedModel, existingModel);
    }

    return preparedModel;
  },

  // Try to find an existing model in the collection based on the given model's video's id.
  _getExistingModel: function(model) {
    var videoId = model instanceof Model ? model.get('video').get('id') : model.video.id;
    var existingModel = this._getByVideoId(videoId);
    return existingModel;
  },

  _clone: function(model) {
    return model instanceof Model ? model.clone() : _.clone(model);
  },

  // Set attributes's id or cid to the model's id or cid to prevent attributes from being added to the collection.
  _copyId: function(preparedModel, existingModel) {
    if (existingModel.has('id')) {
      if (preparedModel instanceof Model) {
        preparedModel.set('id', existingModel.get('id'), {silent: true});
      } else {
        preparedModel.id = existingModel.get('id');
      }
    } else {
      preparedModel.cid = existingModel.cid;
    }
  },

  _getByVideoId: function(videoId) {
    return this.find(function(model) {
      return model.get('video').get('id') === videoId;
    });
  },

  _hasVideo: function(video) {
    return !_.isUndefined(this._getByVideoId(video.get('id')));
  }
};

export default CollectionUniqueVideo;