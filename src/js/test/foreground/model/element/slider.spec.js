import Slider from 'foreground/model/element/slider';
import Orientation from 'foreground/enum/orientation';

describe('Slider', function() {
  beforeEach(function() {
    this.model = new Slider();
  });

  describe('setInitialValues', function() {
    it('should set a provided value', function() {
      this.model.setInitialValues({
        length: 10
      });

      expect(this.model.get('length')).to.equal(10);
    });

    it('should not overwrite with undefined', function() {
      this.model.setInitialValues({
        length: undefined
      });

      expect(this.model.get('length')).to.equal(this.model.defaults.length);
    });

    it('should not overwrite with NaN', function() {
      this.model.setInitialValues({
        length: NaN
      });

      expect(this.model.get('length')).to.equal(this.model.defaults.length);
    });
  });

  describe('getBoundedValue', function() {
    it('should enforce max value', function() {
      this.model.set({
        max: 5
      });

      var boundedValue = this.model.getBoundedValue(10);
      expect(boundedValue).to.equal(this.model.get('max'));
    });

    it('should enforce min value', function() {
      this.model.set({
        min: 2
      });

      var boundedValue = this.model.getBoundedValue(1);
      expect(boundedValue).to.equal(this.model.get('min'));
    });

    it('should enforce step value by rounding down to nearest valid value', function() {
      this.model.set({
        min: 2,
        step: 5
      });

      var boundedValue = this.model.getBoundedValue(3);
      expect(boundedValue).to.equal(this.model.get('min'));
    });

    it('should enforce step value by rounding up to nearest valid value', function() {
      this.model.set({
        min: 2,
        max: 10,
        step: 5
      });

      var boundedValue = this.model.getBoundedValue(6);
      expect(boundedValue).to.equal(7);
    });

    it('should not default to max value if step conflicts', function() {
      this.model.set({
        min: 2,
        max: 10,
        step: 5
      });

      var boundedValue = this.model.getBoundedValue(11);
      expect(boundedValue).to.equal(7);
    });
  });

  it('should default to min value if step conflicts', function() {
    this.model.set({
      min: 2,
      max: 10,
      step: 5
    });

    var boundedValue = this.model.getBoundedValue(-1);
    expect(boundedValue).to.equal(2);
  });

  describe('getValueByPixelValue', function() {
    it('should return a valid value for horizontal orientation', function() {
      this.model.set({
        min: 2,
        max: 10,
        length: 20
      });

      var value = this.model.getValueByPixelValue(10);
      expect(value).to.equal(6);
    });

    it('should return a valid value for vertical orientation', function() {
      this.model.set({
        min: 2,
        max: 10,
        length: 20,
        isVertical: true
      });

      var value = this.model.getValueByPixelValue(10);
      expect(value).to.equal(6);
    });
  });

  describe('getPixelValue', function() {
    it('should return a valid pixel value for horizontal orientation', function() {
      this.model.set({
        min: 2,
        max: 10,
        length: 20
      });

      var pixelValue = this.model.getPixelValue(8);
      expect(pixelValue).to.equal(15);
    });

    it('should flip pixel value for vertical orientation', function() {
      this.model.set({
        min: 2,
        max: 10,
        length: 20,
        isVertical: true
      });

      var pixelValue = this.model.getPixelValue(8);
      expect(pixelValue).to.equal(5);
    });
  });

  describe('getPercentValue', function() {
    it('should be able to return a percent value', function() {
      this.model.set({
        min: 2,
        max: 10
      });

      var percentValue = this.model.getPercentValue(8);
      expect(percentValue).to.equal(0.75);
    });

    it('should return 0 if divide by zero would occur', function() {
      this.model.set({
        min: 0,
        max: 0
      });

      var percentValue = this.model.getPercentValue(0);
      expect(percentValue).to.equal(0);
    });
  });

  describe('getValueByDelta', function() {
    it('should return value incremented by a scaled delta respective of wheelStepScale', function() {
      this.model.set({
        value: 5,
        step: 1,
        wheelStepScale: 3
      });

      expect(this.model.getValueByDelta(1)).to.equal(8);
    });

    it('should return value incremented by a scaled delta respective of step', function() {
      this.model.set({
        value: 5,
        step: 2,
        wheelStepScale: 1
      });

      expect(this.model.getValueByDelta(1)).to.equal(5.5);
    });
  });

  describe('getScaleFactor', function() {
    it('should return the ratio given between length and distance of slider values', function() {
      this.model.set({
        min: 7,
        max: 10,
        length: 2
      });

      expect(this.model.getScaleFactor()).to.equal(1.5);
    });
  });

  describe('getDefaultValue', function() {
    it('should return the average value between min and max', function() {
      this.model.set({
        min: 5,
        max: 10
      });

      expect(this.model.getDefaultValue()).to.equal(7.5);
    });
  });

  describe('_setIsVertical', function() {
    it('should set isVertical to true if orientation is vertical', function() {
      this.model._setIsVertical(Orientation.Vertical);
      expect(this.model.get('isVertical')).to.equal(true);
    });

    it('should set isVertical to false if orientation is horizontal', function() {
      this.model._setIsVertical(Orientation.Horizontal);
      expect(this.model.get('isVertical')).to.equal(false);
    });

    it('should throw an error if an invalid orientation is given', function() {
      var errorEncountered = false;

      try {
        this.model._setIsVertical('');
      } catch (e) {
        errorEncountered = true;
      }

      expect(errorEncountered).to.equal(true);
    });
  });
});