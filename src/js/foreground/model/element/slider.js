import {Model} from 'backbone';
import Orientation from 'foreground/enum/orientation';

var Slider = Model.extend({
  defaults: {
    value: 50,
    max: 100,
    min: 0,
    step: 1,
    // Adjust the step amount by a factor of N during wheel events.
    wheelStepScale: 1,
    // Values stored to determine mouse movement amounts.
    mouseDownValue: 0,
    totalMouseMovement: 0,
    // The cached length of the slider.
    length: 0,
    orientation: Orientation.Horizontal,
    isVertical: false
  },

  initialize: function() {
    this.on('change:orientation', this._onChangeOrientation);
  },

  setInitialValues: function(initialValues) {
    _.forOwn(initialValues, function(value, key) {
      if (!_.isUndefined(value) && !_.isNaN(value)) {
        this.set(key, value);
      }
    }, this);
  },

  // Ensure that a given value falls within the min/max and step parameters.
  getBoundedValue: function(value) {
    var boundedValue = value;

    // Respect min/max values
    if (boundedValue > this.get('max')) {
      boundedValue = this.get('max');
    }

    if (boundedValue < this.get('min')) {
      boundedValue = this.get('min');
    }

    // Round value to the nearest number which is divisible by step.
    // Subtract and re-add min so stepping down will always reach min.
    // Do this after min/max because step should be respected before setting to max.
    boundedValue -= this.get('min');
    boundedValue = this.get('step') * Math.round(boundedValue / this.get('step'));
    boundedValue += this.get('min');

    // Now double-check our rounding to ensure that we respect step + min/max.
    if (boundedValue > this.get('max')) {
      // Subtract step instead of setting to max because should always be able to step down to min.
      boundedValue -= this.get('step');
    }

    if (boundedValue < this.get('min')) {
      boundedValue = this.get('min');
    }

    return boundedValue;
  },

  // Take a given value and return the pixel length needed to represent that value on the slider.
  getPixelValue: function(value) {
    var percentValue = this.getPercentValue(value);
    var pixelValue = percentValue * this.get('length');
    var normalizedPixelValue = this._normalizePixelValue(pixelValue);

    return normalizedPixelValue;
  },

  // Take a given number and determine what percent of the input the value represents.
  getPercentValue: function(value) {
    // Be sure to return 0 instead of NaN incase of divide by zero.
    return (value - this.get('min')) / (this.get('max') - this.get('min')) || 0;
  },

  // Take a denormalized pixelValue and convert it to corresponding slider value.
  getValueByPixelValue: function(pixelValue) {
    var normalizedPixelValue = this._normalizePixelValue(pixelValue);

    // Convert px moved to % distance moved.
    var offsetPercent = normalizedPixelValue / this.get('length');
    // Convert % distance moved into corresponding value.
    var valueDifference = this.get('max') - this.get('min');
    var value = this.get('min') + valueDifference * offsetPercent;

    return value;
  },

  // Return value reflective of a delta amount of change.
  getValueByDelta: function(delta) {
    var scaledDelta = delta / this.get('step') * this.get('wheelStepScale');
    return this.get('value') + scaledDelta;
  },

  // Return a ratio of the range of values able to be iterated over relative to the length of the slider.
  // Useful for converting a pixel amount to a slider value.
  getScaleFactor: function() {
    return (this.get('max') - this.get('min')) / this.get('length');
  },

  // Return the average value of min and max.
  getDefaultValue: function() {
    return (this.get('min') + this.get('max')) / 2;
  },

  _onChangeOrientation: function(model, orientation) {
    this._setIsVertical(orientation);
  },

  // Set a flag indicating whether the slider is vertical or horizontal.
  _setIsVertical: function(orientation) {
    switch (orientation) {
      case Orientation.Horizontal:
        this.set('isVertical', false);
        break;
      case Orientation.Vertical:
        this.set('isVertical', true);
        break;
      default:
        throw new Error('Unexpected orientation: ' + orientation);
    }
  },

  // Invert pixelValue when working with vertical orientation because slider appears flipped 180deg
  _normalizePixelValue: function(pixelValue) {
    return this.get('isVertical') ? this.get('length') - pixelValue : pixelValue;
  }
});

export default Slider;