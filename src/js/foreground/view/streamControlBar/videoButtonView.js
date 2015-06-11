define(function(require) {
  'use strict';

  var Tooltipable = require('foreground/view/behavior/tooltipable');
  var VideoButtonTemplate = require('text!template/streamControlBar/videoButton.html');
  var VideoIconTemplate = require('text!template/icon/videoIcon_18.svg');

  var VideoButtonView = Marionette.ItemView.extend({
    id: 'videoButton',
    className: 'button button--icon button--icon--secondary button--medium',
    template: _.template(VideoButtonTemplate),
    templateHelpers: {
      videoIcon: _.template(VideoIconTemplate)()
    },

    attributes: {
      'data-ui': 'tooltipable'
    },

    events: {
      'click': '_onClick'
    },

    modelEvents: {
      'change:enabled': '_onChangeEnabled'
    },

    behaviors: {
      Tooltipable: {
        behaviorClass: Tooltipable
      }
    },

    onRender: function() {
      this._setState(this.model.get('enabled'), this.model.getStateMessage());
    },

    _onClick: function() {
      this.model.toggleEnabled();
    },

    _onChangeEnabled: function(model, enabled) {
      this._setState(enabled, model.getStateMessage());
    },

    _setState: function(enabled, stateMessage) {
      this.$el.toggleClass('is-enabled', enabled).attr('data-tooltip-text', stateMessage);
    }
  });

  return VideoButtonView;
});