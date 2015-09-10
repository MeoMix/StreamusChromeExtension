// Entities which need to keep track of their sequence in order to be ordered properly
// while also maintaing efficiency with CRUD operations.
import _ from 'common/shim/lodash.reference.shim';
import Direction from 'common/enum/direction';

export default {
  comparator: 'sequence',

  moveToIndex: function(modelId, index, options) {
    options = _.isUndefined(options) ? {} : options;

    var model = this.get(modelId);
    var currentIndex = this.indexOf(model);
    var moveResult = {
      moved: false,
      direction: Direction.None
    };

    // If the model is already at the given index then no work needs to be done.
    if (currentIndex !== index) {
      moveResult.direction = currentIndex < index ? Direction.Down : Direction.Up;
      var sequence = this.getSequenceFromIndexDuringMove(index, moveResult.direction);
      model.save({sequence: sequence}, {patch: true});

      // Collections with a comparator will not automatically re-sort if you later change model attributes
      this.sort({silent: options.silent});
      moveResult.moved = true;
    }

    return moveResult;
  },

  getSequenceFromIndexDuringMove: function(index, direction) {
    var sequenceIncrement = 10000;
    var lowSequence;
    var highSequence;

    if (direction === Direction.Down) {
      lowSequence = this.at(index).get('sequence');

      if (index + 1 < this.length) {
        highSequence = this.at(index + 1).get('sequence');
      } else {
        highSequence = this._getMaxHighSequence(sequenceIncrement);
      }
    } else {
      lowSequence = 0;
      if (index - 1 >= 0) {
        lowSequence = this.at(index - 1).get('sequence');
      }

      highSequence = this.at(index).get('sequence');
    }

    var sequence = (lowSequence + highSequence) / 2;
    return sequence;
  },

  // Return what sequence number would be necessary to be at the given index
  // If skippedModelId is given then it will be skipped (useful when moving an item already in collection)
  getSequenceFromIndex: function(index) {
    var sequence;
    var sequenceIncrement = 10000;

    if (this.length === 0) {
      sequence = sequenceIncrement;
    } else {
      // lowSequence is either the previous model's sequence or 0.
      var lowSequence = 0;
      if (index > 0) {
        lowSequence = this.at(index - 1).get('sequence');
      }

      // highSequence is either the next models' sequence or the maximum sequence + (sequenceIncrement * 2)
      var highSequence;
      if (index < this.length) {
        highSequence = this.at(index).get('sequence');
      } else {
        highSequence = this._getMaxHighSequence(sequenceIncrement);
      }

      sequence = (lowSequence + highSequence) / 2;
    }

    return sequence;
  },

  _getMaxHighSequence: function(sequenceIncrement) {
    var maxHighSequence = this.at(this.length - 1).get('sequence') + (sequenceIncrement * 2);
    return maxHighSequence;
  }
};