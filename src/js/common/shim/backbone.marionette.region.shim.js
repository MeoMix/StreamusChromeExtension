define(function(require) {
  'use strict';

  require('backbone.marionette');

  Marionette.Region.buildRegion = function(regionConfig, DefaultRegionClass) {
    if (_.isString(regionConfig)) {
      regionConfig = '[data-region=' + regionConfig + ']';
      return this._buildRegionFromSelector(regionConfig, DefaultRegionClass);
    }

    if (regionConfig.selector || regionConfig.el || regionConfig.regionClass) {
      if (regionConfig.selector) {
        regionConfig.selector = '[data-region=' + regionConfig.selector + ']';
      }
      if (regionConfig.el) {
        regionConfig.el = '[data-region=' + regionConfig.el + ']';
      }
      return this._buildRegionFromObject(regionConfig, DefaultRegionClass);
    }

    if (_.isFunction(regionConfig)) {
      return this._buildRegionFromRegionClass(regionConfig);
    }

    throw new Marionette.Error({
      message: 'Improper region configuration type.',
      url: 'marionette.region.html#region-configuration-types'
    });
  };
});