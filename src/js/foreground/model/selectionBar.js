define(function () {
    'use strict';

    var SelectionBar = Backbone.Model.extend({
        defaults: {
            //  A reference to the collection which currently has selected models. Only one collection can have selected models at a time.
            activeCollection: null
            //canAdd: false,
            //canDelete: false,
            //canSave: false,
            //canPlay: false
        },
        
        initialize: function () {
            //this._setState(this.get('activeCollection'));
            //this.on('change:activeCollection', this._onChangeActiveCollection);
        },
        
        _onChangeActiveCollection: function(model, activeCollection) {
            this._setState(activeCollection);
        },
        
        _setState: function (activeCollection) {
            var activeCollectionExists = activeCollection !== null;

            this.set('canSave', activeCollectionExists);
            this.set('canPlay', activeCollectionExists);
            
            //  Search results are unable to be deleted
            this.set('canDelete', activeCollectionExists && !activeCollection.isImmutable);

            //  TODO: I need to be able to check streamItems for duplicates with the activeCollection and also if streamItems has items added/removed I need to re-update canAdd
            // var duplicatesInfo = this.streamItems.getDuplicatesInfo(activeCollection.getSelectedSongs());
            //this.set('canAdd', activeCollectionExists);
        }
    });

    return SelectionBar;
});