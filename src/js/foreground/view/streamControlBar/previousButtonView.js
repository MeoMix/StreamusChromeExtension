import {LayoutView} from 'marionette';
import previousButtonTemplate from 'template/streamControlBar/previousButton.hbs!';
import previousIconTemplate from 'template/icon/previousIcon_24.hbs!';

var PreviousButton = LayoutView.extend({
  id: 'previousButton',
  className: 'button button--icon button--icon--primary button--large',
  template: previousButtonTemplate,
  templateHelpers: {
    previousIcon: previousIconTemplate
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