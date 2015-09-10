import {LayoutView} from 'marionette';
import nextButtonTemplate from 'template/streamControlBar/nextButton.hbs!';
import nextIconTemplate from 'template/icon/nextIcon_24.hbs!';

var NextButtonView = LayoutView.extend({
  id: 'nextButton',
  className: 'button button--icon button--icon--primary button--large',
  template: nextButtonTemplate,
  templateHelpers: {
    nextIcon: nextIconTemplate
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