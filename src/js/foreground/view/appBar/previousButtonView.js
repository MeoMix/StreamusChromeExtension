define([
    'text!template/appBar/previousButton.html'
], function (PreviousButtonTemplate) {
    'use strict';

    var PreviousButton = Marionette.ItemView.extend({
        id: 'previousButton',
        className: 'button button--icon button--icon--primary button--large',
        template: _.template(PreviousButtonTemplate),
        
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
            this.model.tryDoTimeBasedPrevious();
        },
        
        _onChangeEnabled: function (model, enabled) {
            this._setState(enabled);
        },
        
        _setState: function (enabled) {
            this.$el.toggleClass('disabled', !enabled);
        }
    });

    return PreviousButton;
});