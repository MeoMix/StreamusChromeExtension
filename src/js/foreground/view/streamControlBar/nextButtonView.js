import {LayoutView} from 'marionette';
import {streamControlBar_nextButton as NextButtonTemplate} from 'common/templates';
import {icon_nextIcon_24 as NextIconTemplate} from 'common/templates';

var NextButtonView = LayoutView.extend({
  id: 'nextButton',
  className: 'button button--icon button--icon--primary button--large',
  template: NextButtonTemplate,
  templateHelpers: {
    nextIcon: NextIconTemplate()
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