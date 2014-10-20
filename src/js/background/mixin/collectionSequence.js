//  Entities which need to keep track of their sequence in order to be ordered properly
//  while also maintaing efficiency with CRUD operations.
define({
    comparator: 'sequence',

    moveToIndex: function(modelId, index) {
        var model = this.get(modelId);
        var sequence = this.getSequenceFromIndex(index);

        console.log('model', model);
        model.save({ sequence: sequence }, { patch: true });

        //  Collections with a comparator will not automatically re-sort if you later change model attributes
        this.sort();
    },

    //  Return what sequence number would be necessary to be at the given index     
    getSequenceFromIndex: function (index) {
        var sequence;
        var sequenceIncrement = 10000;

        if (this.length === 0) {
            sequence = sequenceIncrement;
        } else {
            //  highSequence is either the next models' sequence or the maximum sequence + (sequenceIncrement * 2)
            var highSequence;
            if (index < this.length) {
                highSequence = this.at(index).get('sequence');
            } else {
                highSequence = this.at(this.length - 1).get('sequence') + (sequenceIncrement * 2);
            }

            //  lowSequence is either the previous model's sequence or 0.
            var lowSequence = 0;
            if (index > 0) {
                lowSequence = this.at(index - 1).get('sequence');
            }

            sequence = (highSequence + lowSequence) / 2;
        }

        return sequence;
    }
});