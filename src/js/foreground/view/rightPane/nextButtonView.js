define([
    'text!template/rightPane/nextButton.html'
], function (NextButtonTemplate) {
    'use strict';

    var NextButtonView = Backbone.Marionette.ItemView.extend({
        tagName: 'button',
        id: 'nextButton',
        className: 'button--icon button--large',
        template: _.template(NextButtonTemplate),

        events: {
            'click': '_onClick'
        },

        modelEvents: {
            'change:enabled': '_onChangeEnabled'
        },
        
        onRender: function () {
            this._setState(this.model.get('enabled'));
        },

        _onClick: function () {
            this.model.tryActivateNextStreamItem();
        },

        _onChangeEnabled: function (model, enabled) {
            this._setState(enabled);
        },

        _setState: function (enabled) {
            this.$el.toggleClass('disabled', !enabled);
        }
    });

    return NextButtonView;
});