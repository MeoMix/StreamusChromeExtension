define([
   'foreground/view/genericForegroundView',
    'foreground/view/rightPane/stream/streamItemsView',
    'text!template/stream.html',
    'foreground/view/rightPane/stream/repeatButtonView',
    'foreground/view/rightPane/stream/shuffleButtonView',
    'foreground/view/rightPane/stream/radioButtonView',
    'foreground/view/rightPane/stream/saveStreamButtonView',
    'foreground/view/rightPane/stream/clearStreamButtonView'
], function (GenericForegroundView, StreamItemsView, StreamTemplate, RepeatButtonView, ShuffleButtonView, RadioButtonView, SaveStreamButtonView, ClearStreamButtonView) {
    'use strict';
    
    var StreamView = GenericForegroundView.extend({
        
        className: 'stream',
        
        radioButtonView: null,
        shuffleButtonView: null,
        repeatButtonView: null,
        saveStreamButtonView: null,
        clearStreamButtonView: null,
        streamItemsView: null,

        template: _.template(StreamTemplate),

        render: function () {

            this.$el.html(this.template());

            this.$el.children('#streamItemsView').replaceWith(this.streamItemsView.render().el);
           
            var contextButtons = this.$el.children('.context-buttons');

            var rightGroupContextButtons = contextButtons.children('.right-group');

            rightGroupContextButtons.append(this.saveStreamButtonView.render().el);
            rightGroupContextButtons.append(this.clearStreamButtonView.render().el);

            var leftGroupContextButtons = contextButtons.children('.left-group');

            leftGroupContextButtons.append(this.shuffleButtonView.render().el);
            leftGroupContextButtons.append(this.repeatButtonView.render().el);
            leftGroupContextButtons.append(this.radioButtonView.render().el);

            return this;
        },
        
        initialize: function() {
            this.radioButtonView = new RadioButtonView();
            this.shuffleButtonView = new ShuffleButtonView();
            this.repeatButtonView = new RepeatButtonView();
            this.saveStreamButtonView = new SaveStreamButtonView();
            this.clearStreamButtonView = new ClearStreamButtonView();
            this.streamItemsView = new StreamItemsView();
        }

    });

    return StreamView;
});