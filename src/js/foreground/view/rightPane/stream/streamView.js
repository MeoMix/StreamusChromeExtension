define([
    'foreground/view/genericForegroundView',
    'foreground/view/rightPane/stream/streamItemsView',
    'text!template/stream.html',
    'foreground/collection/streamItems',
    'foreground/view/rightPane/stream/repeatButtonView',
    'foreground/view/rightPane/stream/shuffleButtonView',
    'foreground/view/rightPane/stream/radioButtonView',
    'foreground/view/rightPane/stream/saveStreamButtonView',
    'foreground/view/rightPane/stream/clearStreamButtonView'
], function (GenericForegroundView, StreamItemsView, StreamTemplate, StreamItems, RepeatButtonView, ShuffleButtonView, RadioButtonView, SaveStreamButtonView, ClearStreamButtonView) {
    'use strict';
    
    var StreamView = GenericForegroundView.extend({
        
        attributes: {
            'id': 'stream'
        },
        
        radioButtonView: null,
        shuffleButtonView: null,
        repeatButtonView: null,
        saveStreamButtonView: null,
        clearStreamButtonView: null,
        streamItemsView: null,
        
        contextButtons: null,
        streamEmptyMessage: null,

        template: _.template(StreamTemplate),

        render: function () {

            this.$el.html(this.template());

            this.$el.find('#streamItemsView').replaceWith(this.streamItemsView.render().el);
           
            this.$el.find('#saveStreamButtonView').replaceWith(this.saveStreamButtonView.render().el);
            this.$el.find('#clearStreamButtonView').replaceWith(this.clearStreamButtonView.render().el);

            this.$el.find('#shuffleButtonView').replaceWith(this.shuffleButtonView.render().el);
            this.$el.find('#repeatButtonView').replaceWith(this.repeatButtonView.render().el);
            this.$el.find('#radioButtonView').replaceWith(this.radioButtonView.render().el);
           
            this.streamEmptyMessage = this.$el.find('.streamEmpty');
            this.contextButtons = this.$el.find('.context-buttons');

            this.toggleBigText();
            this.toggleContextButtons();
            
            return this;
        },
        
        initialize: function() {
            this.radioButtonView = new RadioButtonView();
            this.shuffleButtonView = new ShuffleButtonView();
            this.repeatButtonView = new RepeatButtonView();
            this.saveStreamButtonView = new SaveStreamButtonView();
            this.clearStreamButtonView = new ClearStreamButtonView();
            this.streamItemsView = new StreamItemsView();
            
            this.listenTo(StreamItems, 'add remove reset', function() {
                this.toggleBigText();
                this.toggleContextButtons();
            });
        },
        
        //  Set the visibility of any visible text messages.
        toggleBigText: function () {
            var isStreamEmpty = StreamItems.length === 0;
            this.streamEmptyMessage.toggleClass('hidden', !isStreamEmpty);
        },
        
        //  Set the visibility of context buttons based on the state of the Stream
        toggleContextButtons: function () {

            if (StreamItems.length === 0) {
                this.contextButtons.hide();
            } else {
                this.contextButtons.show();
            }
        }

    });

    return StreamView;
});