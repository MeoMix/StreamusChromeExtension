import {LayoutView} from 'marionette';
import ResizeEmitter from 'foreground/view/behavior/resizeEmitter';
import Slider from 'foreground/model/element/slider';
import SliderTemplate from 'template/element/slider.html!text';

// Provide a Web Component implementation of <input type='range'> which doesn't utilize an <input> element
// nor any browser stylings. Should support most expected behaviors of an input element.
// Notable differences include support for vertical styling and default support for 'wheel' events.
var SliderView = LayoutView.extend({
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

  modelEvents: {
    'change:length': '_onChangeLength'
  },

  behaviors: {
    ResizeEmitter: {
      behaviorClass: ResizeEmitter
    }
  },

  _mouseDownValue: 0,
  _totalMouseMovement: 0,
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
    // Only set defaults after attached to ensure that we read proper values from the DOM.
    this._setDefaultValues();

    // Cache the length of the slider once it is known.
    this.model.set('length', this._getElementLength());

    // Initialize with default value and update layout. Can only be done once length is known.
    // Check el.value first because if $.val() was called before onAttach then that value should be used.
    var valueAttribute = _.isUndefined(this.el.value) ? this.$el.attr('value') : parseInt(this.el.value, 10);
    var value = _.isUndefined(valueAttribute) ? this.model.getDefaultValue() : parseInt(valueAttribute, 10);
    this._setValue(value, {
      silent: true
    });

    this._isAttached = true;
  },

  onBeforeDestroy: function() {
    this._setWindowEventListeners(false);
    Object.unobserve(this.el, this._onUpdate);
  },

  // Refresh the cached length whenever element resizes.
  onResize: function() {
    this.model.set('length', this._getElementLength());
  },

  setProperty: function(propertyName, propertyValue) {
    // TODO: Make this event-driven. Difficult without computed properties for pixelValue, percentValue and boundedValue.
    if (this._isAttached && this.model.get(propertyName) !== propertyValue) {
      this.model.set(propertyName, propertyValue);

      // If the value hasn't changed then only a repaint is needed to ensure pixelValue and percentValue are represented OK.
      var boundedValue = this.model.getBoundedValue(this.model.get('value'));
      if (boundedValue === this.model.get('value')) {
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
        var offset = this.model.get('isVertical') ? event.offsetY : event.offsetX;
        var value = this.model.getValueByPixelValue(offset);
        this._setValue(value);
      }

      // Start keeping track of mouse movements to be able to adjust the thumb position as the mouse moves.
      this._mouseDownValue = this.model.get('value');
      this._setWindowEventListeners(true);
    }
  },

  // Update the value by one step.
  _onWheel: function(event) {
    var value = this.model.getValueByDelta(event.originalEvent.deltaY / -100);
    this._setValue(value);
  },

  _onWindowMouseMove: function(event) {
    // Invert movementY because vertical is flipped 180deg.
    var movement = this.model.get('isVertical') ? -event.movementY : event.movementX;

    // No action is needed when moving the mouse perpendicular to our direction
    if (movement !== 0) {
      movement *= this.model.getScaleFactor();
      this._totalMouseMovement += movement;
      this._updateMouseMovement();
    }
  },

  _onWindowMouseUp: function() {
    StreamusFG.channels.slider.vent.trigger('mouseUp');
    this._totalMouseMovement = 0;
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

  // When the value of length changes after the view is attached the pixelValue and percentValue
  // computed properties will have changed and thus the layout needs to be updated.
  _onChangeLength: function() {
    // Since length is not known on startup - check isAttached to prevent excess updating.
    if (this._isAttached) {
      this._updateLayout(this.model.get('value'));
    }
  },

  // Derive new value from initial + total movement rather than value + movement.
  // If user drags mouse outside element then current + movement will not equal initial + total movement.
  // Since tons of mouseMove events can fire quickly - throttle based on framerate.
  _updateMouseMovement: _.throttleFramerate(requestAnimationFrame, function() {
    var value = this._mouseDownValue + this._totalMouseMovement;
    this._setValue(value);
  }),

  // Read attributes on DOM element and use them if provided. Otherwise,
  // rely on the HTML5 range input spec for default values.
  _setDefaultValues: function() {
    this.model.setInitialValues({
      orientation: this.$el.attr('orientation'),
      min: parseInt(this.$el.attr('min'), 10),
      max: parseInt(this.$el.attr('max'), 10),
      step: parseInt(this.$el.attr('step'), 10),
      wheelStepScale: parseInt(this.$el.attr('wheelStepScale'), 10)
    });
  },

  // Temporarily add or remove mouse-monitoring events bound the window.
  _setWindowEventListeners: function(isAdding) {
    var action = isAdding ? window.addEventListener : window.removeEventListener;
    action('mousemove', this._onWindowMouseMove);
    action('mouseup', this._onWindowMouseUp);
  },

  // Update the slider with the given value after ensuring it is within bounds.
  _setValue: function(value, options) {
    var boundedValue = this.model.getBoundedValue(value);

    // TODO: Make this event driven: difficult to do because of silent. Still need to update layout when silent. Just not trigger.
    if (this.model.get('value') !== boundedValue) {
      this.model.set('value', boundedValue);
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
    var boundedValue = this.model.getBoundedValue(value);
    var percentValue = this.model.getPercentValue(boundedValue);
    var pixelValue = this.model.getPixelValue(boundedValue);
    var axis = this.model.get('isVertical') ? 'Y' : 'X';
    this.ui.thumb.css('transform', 'translate' + axis + '(' + pixelValue + 'px)');
    this.ui.track.css('transform', 'scale' + axis + '(' + percentValue + ')');
  },

  // Query the DOM for width or height of the slider and return it.
  // Method is slow and should only be used when cached length is stale.
  _getElementLength: function() {
    return this.model.get('isVertical') ? this.$el.height() : this.$el.width();
  }
});

// Register the SliderView as a Web Component for easier re-use.
document.registerElement('streamus-slider', {
  prototype: _.extend(Object.create(HTMLElement.prototype), {
    createdCallback: function() {
      var sliderView = new SliderView({
        el: this,
        model: new Slider()
      });
      sliderView.render();

      this.view = sliderView;
    },
    attachedCallback: function() {
      this.view.triggerMethod('attach');
    },
    detachedCallback: function() {
      this.view.destroy();
      delete this.view;
    },
    // Respond to changes made to the element through node.setAttribute or $.attr('');
    attributeChangedCallback: function(attributeName) {
      var attributeValue = parseInt(this.getAttribute(attributeName), 10) || 0;

      switch (attributeName) {
        case 'max':
        case 'min':
        case 'step':
        case 'value':
          this.view.setProperty(attributeName, attributeValue);
          break;
        case 'wheelStepScale':
          this.view.model.set('wheelStepScale', attributeValue);
      }
    }
  })
});

export default SliderView;