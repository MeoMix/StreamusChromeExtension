import {LayoutView} from 'marionette';
import {streamControlBar_previousButton as PreviousButtonTemplate} from 'common/templates';
import {icon_previousIcon_24 as PreviousIconTemplate} from 'common/templates';

var PreviousButton = LayoutView.extend({
  id: 'previousButton',
  className: 'button button--icon button--icon--primary button--large',
  template: PreviousButtonTemplate,
  templateHelpers: {
    previousIcon: PreviousIconTemplate()
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