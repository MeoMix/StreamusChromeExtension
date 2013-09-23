define(function () {
    'use strict';

    //  TODO: Consider renaming from Radio to Discovery -- sounds nicer..
    var RadioButtonView = Backbone.View.extend({
        className: 'radioButton button',
        
        template: _.template($('#radioButtonTemplate').html()),
        
        events: {
            'click': 'toggleRadio'
        },

        enabledTitle: chrome.i18n.getMessage("radioEnabled"),
        disabledTitle: chrome.i18n.getMessage("radioDisabled"),
        
        render: function () {
            this.$el.html(this.template(this.model.toJSON()));
            
            //  TODO: Consider using the same class (pressed or disabled) for all buttons.
            this.$el.toggleClass('pressed', this.model.get('enabled'));
            
            if (this.model.get('enabled')) {
                this.$el.attr('title', this.enabledTitle);
            } else {
                this.$el.attr('title', this.disabledTitle);
            }
            
            return this;
        },
        
        initialize: function () {
            this.listenTo(this.model, 'change:enabled', this.render);
        },
        
        toggleRadio: function () {
            this.model.toggleRadio();
        }

    });

    return RadioButtonView;
});