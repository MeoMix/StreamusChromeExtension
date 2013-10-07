define([
    'text!../template/dialog.htm'
], function (DialogTemplate) {
    'use strict';

    var DialogView = Backbone.View.extend({

        className: function() {
            //  Set the dialog's class based on the model's type.
            var className = 'alert alert-' + this.model.get('type');

            return className;
        },

        template: _.template(DialogTemplate),

        events: {
            'click button.close': 'close'
        },

        render: function () {
            this.$el.html(this.template(this.model.toJSON()));

            return this;
        },

        initialize: function () {
            this.listenTo(this.model, 'destroy', this.remove);
        },

        close: function () {
            this.model.destroy();
        }

    });

    return DialogView;
});