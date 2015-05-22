define(function(require) {
    'use strict';

    var SimpleMenuItem = require('foreground/model/simpleMenu/simpleMenuItem');

    var SimpleMenuItems = Backbone.Collection.extend({
        model: SimpleMenuItem,

        initialize: function() {
            this.on('change:active', this._onChangeActive);
        },

        getActive: function() {
            return this.findWhere({active: true});
        },

        //  Enforce that only one model can be active at a time by deactivating all other models when one becomes active.
        _onChangeActive: function(model, active) {
            if (active) {
                this._deactivateAllExcept(model);
            }
        },

        //  Ensure only one menu item can be active at a time.
        _deactivateAllExcept: function(changedModel) {
            this.each(function(model) {
                if (model !== changedModel) {
                    model.set('active', false);
                }
            });
        }
    });

    return SimpleMenuItems;
});