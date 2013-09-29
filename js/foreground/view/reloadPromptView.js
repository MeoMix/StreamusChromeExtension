define([
    'reloadPrompt'
], function (ReloadPrompt) {
    'use strict';

    var RestartPromptView = Backbone.View.extend({

        className: 'modalOverlay reloadPrompt',

        template: _.template($('#reloadPromptTemplate').html()),

        model: new ReloadPrompt,

        events: {
            'click': 'reload'
        },

        render: function () {
            this.$el.html(this.template(this.model.toJSON()));
            return this;
        },

        reload: function () {

            chrome.runtime.reload();

        }

    });

    return RestartPromptView;
});