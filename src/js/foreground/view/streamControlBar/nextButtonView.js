import _ from 'common/shim/lodash.reference.shim';
import {LayoutView} from 'marionette';
import NextButtonTemplate from 'template/streamControlBar/nextButton.html!text';
import NextIconTemplate from 'template/icon/nextIcon_24.svg!text';

var NextButtonView = LayoutView.extend({
  id: 'nextButton',
  className: 'button button--icon button--icon--primary button--large',
  template: _.template(NextButtonTemplate),
  templateHelpers: {
    nextIcon: _.template(NextIconTemplate)()
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
    this.model.tryActivateNextStreamItem();
  },

  _onChangeEnabled: function(model, enabled) {
    this._setState(enabled);
  },

  _setState: function(enabled) {
    this.$el.toggleClass('is-disabled', !enabled);
  }
});

export default NextButtonView;