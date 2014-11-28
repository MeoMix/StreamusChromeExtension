define(function() {
    'use strict';
    
    var ListItemButtonsView = Marionette.ItemView.extend({
        template: false,

        //  Render a collection of button views to keep things DRY between various types of list-items:        
        onRender: function () {
            var documentFragment = document.createDocumentFragment();
            this.shownButtonViews = [];

            _.each(this.options.buttonViews, function(ButtonView) {
                var buttonView = new ButtonView({
                    model: this.model
                });

                documentFragment.appendChild(buttonView.render().el);
                buttonView.triggerMethod('show');
                this.shownButtonViews.push(buttonView);
            }, this);

            this.$el.append(documentFragment);
        },
        
        onBeforeDestroy: function () {
            _.each(this.shownButtonViews, function (shownButtonView) {
                shownButtonView.destroy();
            });
            this.shownButtonViews.length = 0;
        }
    });

    return ListItemButtonsView;
});