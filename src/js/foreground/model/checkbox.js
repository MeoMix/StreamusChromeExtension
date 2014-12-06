define([
    'common/enum/checkboxState'
], function (CheckboxState) {
    'use strict';

    var Checkbox = Backbone.Model.extend({
        defaults: {
            //  Primary checkboxes are colored more boldly than secondary.
            primary: true,
            checked: false,
            state: CheckboxState.Stationary,
            labelText: '',
            //  Often times a checkbox has a 1:1 relationship with a model property.
            //  Linking that property to its checkbox allows working with a collection of checkboxes more easily.
            property: ''
        },
        
        toggleState: function() {
            this._setNextState(false);
        },
        
        advanceState: function () {
            this._setNextState(true);
        },
        
        _setNextState: function (allowStationary) {
            var nextState = null;
            var currentState = this.get('state');

            switch (currentState) {
                case CheckboxState.Stationary:
                    nextState = CheckboxState.Collapsing;
                    break;
                case CheckboxState.Collapsing:
                    nextState = CheckboxState.Expanding;
                    break;
                case CheckboxState.Expanding:
                    //  If the checkbox is expanding it could either finish expanding or reverse its state.
                    //  It will reverse its state if the user clicks on it while it is expanding.
                    nextState = allowStationary ? CheckboxState.Stationary : CheckboxState.Collapsing;
                    break;
                default:
                    console.error('Unhandled state:', currentState);
                    break;
            }

            this.set('state', nextState);
        }
    });

    return Checkbox;
});