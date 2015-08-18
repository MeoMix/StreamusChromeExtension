define(function(require) {
  'use strict';

  var Orientation = require('foreground/enum/orientation');
  var ResizeEmitter = require('foreground/view/behavior/resizeEmitter');
  var SliderTemplate = require('text!template/element/slider.html');

  // TODO: Touch support
  // TODO: Test cases
  // TODO: Introduce model
  var SliderView = Marionette.ItemView.extend({
    tagName: 'streamus-slider',
    template: _.template(SliderTemplate),

    ui: {
      'track': 'track',
      'thumb': 'thumb'
    },

    events: {
      'mousedown': '_onMouseDown',
      'wheel': '_onWheel'
    },

    behaviors: {
      ResizeEmitter: {
        behaviorClass: ResizeEmitter
      }
    },

    // Values parsed from the HTML declaration.
    value: -1,
    max: 100,
    min: 0,
    step: 1,
    wheelStepScale: 1,
    // Values stored to determine mouse movement amounts.
    mouseDownValue: 0,
    totalMouseMovement: 0,
    // The cached length of the slider.
    length: -1,
    orientation: Orientation.Horizontal,
    isVertical: false,
    _isAttached: false,

    initialize: function() {
      // It's important to bind pre-emptively or attempts to call removeEventListener will fail to find the appropriate reference.
      _.bindAll(this, '_onWindowMouseMove', '_onWindowMouseUp', '_onWheel', '_onUpdate');
      // Provide a throttled version of _onWheel because wheel events can fire at a high rate.
      // https://developer.mozilla.org/en-US/docs/Web/Events/wheel
      this._onWheel = _.throttleFramerate(requestAnimationFrame, this._onWheel);
      Object.observe(this.el, this._onUpdate, ['update']);
    },

    onAttach: function() {
      this._isAttached = true;
      // Only set defaults after attached to ensure that we read proper values from the DOM.
      this._setDefaultValues();

      // Cache the length of the slider once it is known.
      this.length = this._getLength();

      // Initialize with default value and update layout. Can only be done once length is known.
      // Check el.value first because if $.val() was called before onAttach then that value should be used.
      var valueAttribute = _.isUndefined(this.el.value) ? this.$el.attr('value') : parseInt(this.el.value, 10);
      var value = _.isUndefined(valueAttribute) ? this._getDefaultValue() : parseInt(valueAttribute, 10);
      this._setValue(value, {
        silent: true
      });
    },

    onBeforeDestroy: function() {
      this._setWindowEventListeners(false);
      Object.unobserve(this.el, this._onUpdate);
    },

    // Refresh the cached length and update layout whenever element resizes.
    onResize: function() {
      var length = this._getLength();

      if (this.length !== length) {
        this.length = length;
        this._updateLayout(this.value);
      }
    },

    setProperty: function(propertyName, propertyValue) {
      // TODO: Prefer not having to check _isAttached
      if (this._isAttached && this[propertyName] !== propertyValue) {
        this[propertyName] = propertyValue;

        var boundedValue = this._getBoundedValue(this.value);
        if (boundedValue === this.value) {
          this._updateLayout(boundedValue);
        } else {
          this._setValue(boundedValue, {
            // Range input does not emit 'input' event when value attribute is changed.
            silent: true
          });
        }
      }
    },

    // Monitor changes to the user's mouse position after they begin clicking
    // on the track. Adjust the thumb position based on mouse movements.
    _onMouseDown: function(event) {
      // Don't run this logic on right-click.
      if (event.button === 0) {
        var target = event.target;
        StreamusFG.channels.slider.vent.trigger('mouseDown');

        // Snap the thumb to the mouse's position, but only do so if the mouse isn't clicking the thumb.
        if (target !== this.ui.thumb[0]) {
          var offset = this.isVertical ? event.offsetY : event.offsetX;
          var value = this._getValueByPixelValue(offset);
          this._setValue(value);
        }

        // Start keeping track of mouse movements to be able to adjust the thumb position as the mouse moves.
        this.mouseDownValue = this.value;
        this._setWindowEventListeners(true);
      }
    },

    // Update the value by one step.
    _onWheel: function(event) {
      var value = this.value + event.originalEvent.deltaY / (-100 / this.step) * this.wheelStepScale;
      this._setValue(value);
    },

    _onWindowMouseMove: function(event) {
      // Invert movementY because vertical is flipped 180deg.
      var movement = this.isVertical ? -event.movementY : event.movementX;

      // No action is needed when moving the mouse perpendicular to our direction
      if (movement !== 0) {
        movement *= this._getScaleFactor();
        this.totalMouseMovement += movement;
        // Derive new value from initial + total movement rather than value + movement.
        // If user drags mouse outside element then current + movement will not equal initial + total movement.
        var value = this.mouseDownValue + this.totalMouseMovement;
        this._setValue(value);
      }
    },

    _onWindowMouseUp: function() {
      StreamusFG.channels.slider.vent.trigger('mouseUp');
      this.totalMouseMovement = 0;
      this._setWindowEventListeners(false);
    },

    // Whenever the element's .value property is modified respond by updating the view's value.
    // This will run for the property being modified not for the DOM attribute being modified.
    _onUpdate: function(changes) {
      var valueUpdates = _.where(changes, {
        name: 'value'
      });

      if (valueUpdates.length > 0) {
        this._setValue(this.el.value, {
          silent: true
        });
      }
    },

    // Read attributes on DOM element and use them if provided. Otherwise,
    // rely on the HTML5 range input spec for default values.
    _setDefaultValues: function() {
      this.orientation = this.$el.attr('orientation') || this.orientation;
      this.isVertical = this.orientation === Orientation.Vertical;
      this.min = parseInt(this.$el.attr('min'), 10) || this.min;
      this.max = parseInt(this.$el.attr('max'), 10) || this.max;
      this.step = parseInt(this.$el.attr('step'), 10) || this.step;
      this.wheelStepScale = parseInt(this.$el.attr('wheelStepScale'), 10) || this.wheelStepScale;
    },

    // Temporarily add or remove mouse-monitoring events bound the window.
    _setWindowEventListeners: function(isAdding) {
      var action = isAdding ? window.addEventListener : window.removeEventListener;
      action('mousemove', this._onWindowMouseMove);
      action('mouseup', this._onWindowMouseUp);
    },

    // Update the slider with the given value after ensuring it is within bounds.
    _setValue: function(value, options) {
      var boundedValue = this._getBoundedValue(value);

      if (this.value !== boundedValue) {
        this.value = boundedValue;
        // Be sure to record value on the element so $.val() and .value will yield proper values.
        this.el.value = boundedValue;
        this._updateLayout(boundedValue);

        if (_.isUndefined(options) || !options.silent) {
          this.$el.trigger('input', boundedValue);
        }
      }
    },

    // Visually update the track and thumb elements.
    // Set their translate and scale values such that they represent the given value.
    _updateLayout: function(value) {
      var boundedValue = this._getBoundedValue(value);
      var percentValue = this._getPercentValue(boundedValue);
      var pixelValue = this._getPixelValue(boundedValue);
      var axis = this.isVertical ? 'Y' : 'X';
      this.ui.thumb.css('transform', 'translate' + axis + '(' + pixelValue + 'px)');
      this.ui.track.css('transform', 'scale' + axis + '(' + percentValue + ')');
    },

    // Ensure that a given value falls within the min/max and step parameters.
    _getBoundedValue: function(value) {
      var boundedValue = value;

      // Respect min/max values
      if (boundedValue > this.max) {
        boundedValue = this.max;
      }

      if (boundedValue < this.min) {
        boundedValue = this.min;
      }

      // Round value to the nearest number which is divisible by step.
      // Subtract and re-add min so stepping down will always reach min.
      // Do this after min/max because step should be respected before setting to max.
      boundedValue -= this.min;
      boundedValue = this.step * Math.round(boundedValue / this.step);
      boundedValue += this.min;

      return boundedValue;
    },

    // Return the average value between min and max.
    // Useful when no value has been provided on the HTML element.
    _getDefaultValue: function() {
      return this.min + (this.max - this.min) / 2;
    },

    // Take a given number and determine what percent of the input the value represents.
    _getPercentValue: function(value) {
      return (value - this.min) / (this.max - this.min) || 0;
    },

    // Take a given value and return the pixel length needed to represent that value on the slider.
    _getPixelValue: function(value) {
      var percentValue = this._getPercentValue(value);
      var pixelValue;

      // Calculating pixelValue for vertical requires inverting the math because
      // the slider needs to appear flipped 180deg to feel correct.
      if (this.isVertical) {
        pixelValue = (1 - percentValue) * this.length;
      } else {
        pixelValue = percentValue * this.length;
      }

      return pixelValue;
    },

    // Take a given pixelValue and convert it to corresponding slider value.
    _getValueByPixelValue: function(pixelValue) {
      // Vertical slider needs to be flipped 180 so inverse the value.
      if (this.isVertical) {
        pixelValue = this.length - pixelValue;
      }

      // Convert px moved to % distance moved.
      var offsetPercent = pixelValue / this.length;
      // Convert % distance moved into corresponding value.
      var valueDifference = this.max - this.min;
      var value = this.min + valueDifference * offsetPercent;

      return value;
    },

    // Query the DOM for width or height of the slider and return it.
    // Method is slow and should only be used when cached length is stale.
    _getLength: function() {
      return this.isVertical ? this.$el.height() : this.$el.width();
    },

    // Return a ratio of the range of values able to be iterated over relative to the length of the slider.
    // Useful for converting a pixel amount to a slider value.
    _getScaleFactor: function() {
      return (this.max - this.min) / this.length;
    }
  });

  // Register the SliderView as a Web Component for easier re-use.
  document.registerElement('streamus-slider', {
    prototype: _.extend(Object.create(HTMLElement.prototype), {
      createdCallback: function() {
        var sliderView = new SliderView({
          el: this
        });
        sliderView.render();

        this.view = sliderView;
      },
      attachedCallback: function() {
        this.view.triggerMethod('attach');
      },
      // Respond to changes made to the element through node.setAttribute or $.attr('');
      attributeChangedCallback: function(attributeName) {
        // TODO: I could also support changing orientation on the fly?
        var attributeValue = parseInt(this.getAttribute(attributeName), 10) || 0;

        switch (attributeName) {
          case 'max':
          case 'min':
          case 'step':
          case 'value':
            this.view.setProperty(attributeName, attributeValue);
            break;
          case 'wheelStepScale':
            this.view.wheelStepScale = attributeValue;
        }
      }
    })
  });

  return SliderView;
});