'use strict';
import {LayoutView} from 'marionette';
import PreviousButtonTemplate from 'template/streamControlBar/previousButton.html!text';
import PreviousIconTemplate from 'template/icon/previousIcon_24.svg!text';

var PreviousButton = LayoutView.extend({
  id: 'previousButton',
  className: 'button button--icon button--icon--primary button--large',
  template: _.template(PreviousButtonTemplate),
  templateHelpers: {
    previousIcon: _.template(PreviousIconTemplate)()
  },

  events: {
    'click': '_onClick'
  },

  modelEvents: {
    'change:enabled': '_onChangeEnabled'
  },

  onRender: function() {
    this._setState(this.model.get('enabled'));
  },

  _onClick: function() {
    this.model.tryDoTimeBasedPrevious();
  },

  _onChangeEnabled: function(model, enabled) {
    this._setState(enabled);
  },

  _setState: function(enabled) {
    this.$el.toggleClass('is-disabled', !enabled);
  }
});

export default PreviousButton;