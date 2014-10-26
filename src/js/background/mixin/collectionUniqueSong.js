define({
    initialize: function () {
        //  Stub out the default implementation of add with one which enforces uniqueness based on song id.
        this.add = this._add;
    },
    
    getDuplicatesInfo: function (songs) {
        songs = _.isArray(songs) ? songs : [songs];

        var duplicates = _.filter(songs, this._hasSong.bind(this));
        var allDuplicates = duplicates.length === songs.length;
        var someDuplicates = !allDuplicates && duplicates.length > 0;
        var message = '';

        var collectionName = this.userFriendlyName.toLowerCase();

        if (allDuplicates) {
            if (songs.length === 1) {
                message = chrome.i18n.getMessage('songAlreadyInCollection', [collectionName]);
            } else {
                message = chrome.i18n.getMessage('allSongsAlreadyInCollection', [collectionName]);
            }
        }
        else if (someDuplicates) {
            message = chrome.i18n.getMessage('songsAlreadyInCollection', [duplicates.length, songs.length, collectionName]);
        }

        return {
            allDuplicates: allDuplicates,
            someDuplicates: someDuplicates,
            message: message
        };
    },

    //  Prevent models from being added to the collection if the model's song is not unique to the collection.
    _add: function (models, options) {
        var preparedModels;

        if (models instanceof Backbone.Collection) {
            preparedModels = models.map(this._prepareModelToAdd.bind(this));
        }
        else if (_.isArray(models)) {
            preparedModels = _.map(models, this._prepareModelToAdd.bind(this));
        } else if (!_.isNull(models) && !_.isUndefined(models)) {
            preparedModels = this._prepareModelToAdd(models);
        } else {
            preparedModels = models;
        }

        //  Call the original add method using preparedModels which have updated their IDs to match any existing models.
        return Backbone.Collection.prototype.add.call(this, preparedModels, options);
    },

    //  NOTE: The function _prepareModel is reserved by Backbone.
    _prepareModelToAdd: function (model) {
        //  If an existing model was not found then just use the given reference.
        var preparedModel = model;
        var existingModel = this._getExistingModel(model);

        //  If an existing model was found then clone the given reference and update its id.
        if (!_.isUndefined(existingModel)) {
            preparedModel = this._clone(model);
            this._copyId(preparedModel, existingModel);
        }

        return preparedModel;
    },
    
    //  Try to find an existing model in the collection based on the given model's song's id.
    _getExistingModel: function (model) {
        var songId = model instanceof Backbone.Model ? model.get('song').get('id') : model.song.id;
        var existingModel = this._getBySongId(songId);
        return existingModel;
    },

    _clone: function (model) {
        return model instanceof Backbone.Model ? _.clone(model.attributes) : _.clone(model);
    },
    
    //  Set attributes's id or cid to the model's id or cid to prevent attributes from being added to the collection.
    _copyId: function (attributes, model) {
        if (model.has('id')) {
            attributes.id = model.get('id');
        } else {
            attributes.cid = model.cid;
        }
    },
    
    _getBySongId: function (songId) {
        return this.find(function (model) {
            return model.get('song').get('id') === songId;
        });
    },
    
    _hasSong: function (song) {
        return !_.isUndefined(this._getBySongId(song.get('id')));
    }
});