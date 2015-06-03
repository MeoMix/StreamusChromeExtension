define(function() {
  'use strict';

  var SimpleListItem = Backbone.Model.extend({
    defaults: function() {
      return {
        property: '',
        labelKey: '',
        value: '',
        options: []
      };
    }
  });

  return SimpleListItem;
});