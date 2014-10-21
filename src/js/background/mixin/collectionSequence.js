//  Entities which need to keep track of their sequence in order to be ordered properly
//  while also maintaing efficiency with CRUD operations.
define({
    comparator: 'sequence',

    moveToIndex: function(modelId, index) {
        var model = this.get(modelId);
        var sequence = this.getSequenceFromIndex(index, modelId);
        var moved = false;

        console.log('new index, sequence, oldIndex, oldSequence', model.get('title'), index, sequence, this.indexOf(model), model.get('sequence'));
        
        if (model.get('sequence') !== sequence) {
            model.save({ sequence: sequence }, { patch: true });

            //  Collections with a comparator will not automatically re-sort if you later change model attributes
            this.sort();
            moved = true;
        }

        return moved;
    },

    //  Return what sequence number would be necessary to be at the given index   
    //  If skippedModelId is given then it will be skipped (useful when moving an item already in collection)
    getSequenceFromIndex: function (index, skippedModelId) {
        var sequence;
        var sequenceIncrement = 10000;

        if (this.length === 0) {
            sequence = sequenceIncrement;
        } else {
            //  highSequence is either the next models' sequence or the maximum sequence + (sequenceIncrement * 2)
            var highSequence = null;
            if (index < this.length) {
                var highModel = this.at(index);

                if (highModel.get('id') === skippedModelId) {
                    var nextIndex = index + 1;
                    
                    if (nextIndex < this.length) {
                        highModel = this.at(nextIndex);
                    } else {
                        highSequence = this._getMaxHighSequence(sequenceIncrement);
                    }
                }
                
                if (highSequence === null) {
                    highSequence = highModel.get('sequence');
                }
            } else {
                highSequence = this._getMaxHighSequence(sequenceIncrement);
            }

            //  lowSequence is either the previous model's sequence or 0.
            var lowSequence = 0;
            if (index > 0) {
                var lowModel = this.at(index - 1);
                
                if (lowModel.get('id') === skippedModelId) {
                    var previousIndex = index - 1;
                    
                    if (previousIndex > 0) {
                        lowModel = this.at(previousIndex);
                    } else {
                        lowModel = null;
                    }
                }
                
                if (lowModel !== null) {
                    lowSequence = lowModel.get('sequence');
                }
            }

            sequence = (highSequence + lowSequence) / 2;
        }

        return sequence;
    },
    
    _getMaxHighSequence: function(sequenceIncrement) {
        return this.at(this.length - 1).get('sequence') + (sequenceIncrement * 2);
    }
});