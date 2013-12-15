define([
    'genericForegroundView',
    'streamItemsView',
    'text!../template/stream.htm',
    'repeatButtonView',
    'shuffleButtonView',
    'radioButtonView',
    'saveStreamButtonView',
    'clearStreamButtonView'
], function (GenericForegroundView, StreamItemsView, StreamTemplate, RepeatButtonView, ShuffleButtonView, RadioButtonView, SaveStreamButtonView, ClearStreamButtonView) {
    'use strict';
    
    var StreamView = GenericForegroundView.extend({
        
        className: 'stream',
        
        radioButtonView: new RadioButtonView(),
        shuffleButtonView: new ShuffleButtonView(),
        repeatButtonView: new RepeatButtonView(),
        saveStreamButtonView: new SaveStreamButtonView(),
        clearStreamButtonView: new ClearStreamButtonView(),

        streamItemsView: new StreamItemsView(),

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
        }

    });

    return StreamView;
});