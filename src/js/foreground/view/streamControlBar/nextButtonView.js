define(function(require) {
  'use strict';

  var NextButtonTemplate = require('text!template/streamControlBar/nextButton.html');
  var NextIconTemplate = require('text!template/icon/nextIcon_24.svg');

  var NextButtonView = Marionette.ItemView.extend({
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

  return NextButtonView;
});