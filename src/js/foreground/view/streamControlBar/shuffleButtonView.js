'use strict';
import {LayoutView} from 'marionette';
import Tooltipable from 'foreground/view/behavior/tooltipable';
import ShuffleButtonTemplate from 'template/streamControlBar/shuffleButton.html!text';
import ShuffleIconTemplate from 'template/icon/shuffleIcon_18.svg!text';

var ShuffleButtonView = LayoutView.extend({
  id: 'shuffleButton',
  className: 'button button--icon button--icon--secondary button--medium',
  template: _.template(ShuffleButtonTemplate),
  templateHelpers: {
    shuffleIcon: _.template(ShuffleIconTemplate)()
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

export default ShuffleButtonView;