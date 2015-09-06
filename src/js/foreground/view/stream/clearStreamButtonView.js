import {LayoutView} from 'marionette';
import Tooltipable from 'foreground/view/behavior/tooltipable';
import ClearStreamDialogView from 'foreground/view/dialog/clearStreamDialogView';
import ViewEntityContainer from 'foreground/view/behavior/viewEntityContainer';
import ClearStreamButtonTemplate from 'template/stream/clearStreamButton.html!text';

var ClearStreamButtonView = LayoutView.extend({
  id: 'clearStreamButton',
  className: 'button button--flat',
  template: _.template(ClearStreamButtonTemplate),
  templateHelpers: {
    clearMessage: chrome.i18n.getMessage('clear')
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
    },
    ViewEntityContainer: {
      behaviorClass: ViewEntityContainer,
      viewEntityNames: ['model']
    }
  },

  onRender: function() {
    this._setState(this.model.get('enabled'), this.model.getStateMessage());
  },

  _onClick: function() {
    if (this.model.get('enabled')) {
      this._showClearStreamDialog();
    }
  },

  _onChangeEnabled: function(model, enabled) {
    this._setState(enabled, model.getStateMessage());
  },

  _setState: function(enabled, stateMessage) {
    this.$el.toggleClass('is-disabled', !enabled).attr('data-tooltip-text', stateMessage);
  },

  _showClearStreamDialog: function() {
    var streamItems = this.model.get('streamItems');

    // When deleting only a single StreamItem it is not necessary to show a dialog because it's not a very dangerous action.
    if (streamItems.length === 1) {
      streamItems.clear();
    } else {
      StreamusFG.channels.dialog.commands.trigger('show:dialog', ClearStreamDialogView, {
        streamItems: streamItems
      });
    }
  }
});

export default ClearStreamButtonView;