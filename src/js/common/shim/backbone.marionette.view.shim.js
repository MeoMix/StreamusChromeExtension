define(function(require) {
  'use strict';

  require('backbone.marionette');

  Marionette.View.prototype.useCustomUiSelector = false;
  Marionette.View.prototype._bindUIElements = function() {
    if (!this.ui) {
      return;
    }

    // store the ui hash in _uiBindings so they can be reset later
    // and so re-rendering the view will be able to find the bindings
    if (!this._uiBindings) {
      this._uiBindings = this.ui;
    }

    // get the bindings result, as a function or otherwise
    var bindings = _.result(this, '_uiBindings');

    // empty the ui so we don't have anything to start with
    this.ui = {};

    // bind each of the selectors
    // TODO: This can be called by a behavior... which is weird, but oh well.
    _.each(bindings, function(selector, key) {
      selector = this.useCustomUiSelector || this.view && this.view.useCustomUiSelector ? selector : '[data-ui~=' + selector + ']';
      this.ui[key] = this.$(selector);
    }, this);
  };

  // normalize the keys of passed hash with the views `ui` selectors.
  // `{"@ui.foo": "bar"}`
  Marionette.View.prototype.normalizeUIKeys = function(hash) {
    var uiBindings = _.result(this, '_uiBindings');
    return Marionette.normalizeUIKeys(hash, uiBindings ||
      _.result(this, 'ui'), this.useCustomUiSelector ||
      this.view && this.view.useCustomUiSelector);
  };

  // normalize the values of passed hash with the views `ui` selectors.
  // `{foo: "@ui.bar"}`
  Marionette.View.prototype.normalizeUIValues = function(hash, properties) {
    var ui = _.result(this, 'ui');
    var uiBindings = _.result(this, '_uiBindings');
    return Marionette.normalizeUIValues(hash, uiBindings ||
      ui, properties, this.useCustomUiSelector ||
      this.view && this.view.useCustomUiSelector);
  };

  // allows for the use of the @ui. syntax within
  // a given key for triggers and events
  // swaps the @ui with the associated selector.
  // Returns a new, non-mutated, parsed events hash.
  Marionette.normalizeUIKeys = function(hash, ui, useCustomUiSelector) {
    return _.reduce(hash, function(memo, val, key) {
      var normalizedKey = Marionette.normalizeUIString(key, ui, useCustomUiSelector);
      memo[normalizedKey] = val;
      return memo;
    }, {});
  };

  // allows for the use of the @ui. syntax within
  // a given value for regions
  // swaps the @ui with the associated selector
  Marionette.normalizeUIValues = function(hash, ui, properties, useCustomUiSelector) {
    _.each(hash, function(val, key) {
      if (_.isString(val)) {
        hash[key] = Marionette.normalizeUIString(val, ui, useCustomUiSelector);
      } else if (_.isObject(val) && _.isArray(properties)) {
        _.extend(val, Marionette.normalizeUIValues(_.pick(val, properties), ui, useCustomUiSelector));
        /* Value is an object, and we got an array of embedded property names to normalize. */
        _.each(properties, function(property) {
          var propertyVal = val[property];
          if (_.isString(propertyVal)) {
            val[property] = Marionette.normalizeUIString(propertyVal, ui, useCustomUiSelector);
          }
        });
      }
    });
    return hash;
  };

  // utility method for parsing @ui. syntax strings
  // into associated selector
  Marionette.normalizeUIString = function(uiString, ui, useCustomUiSelector) {
    return uiString.replace(/@ui\.[a-zA-Z_$0-9]*/g, function(r) {
      var normalizedUIString;

      if (useCustomUiSelector) {
        normalizedUIString = ui[r.slice(4)];
      } else {
        normalizedUIString = '[data-ui~=' + ui[r.slice(4)] + ']';
      }

      return normalizedUIString;
    });
  };
});