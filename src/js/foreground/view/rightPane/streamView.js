define([
    'foreground/model/clearStreamButton',
    'foreground/model/saveStreamButton',
    'foreground/view/rightPane/clearStreamButtonView',
    'foreground/view/rightPane/radioButtonView',
    'foreground/view/rightPane/repeatButtonView',
    'foreground/view/rightPane/saveStreamButtonView',
    'foreground/view/rightPane/shuffleButtonView',
    'foreground/view/rightPane/streamItemsView',
    'text!template/rightPane/stream.html'
], function (ClearStreamButton, SaveStreamButton, ClearStreamButtonView, RadioButtonView, RepeatButtonView, SaveStreamButtonView, ShuffleButtonView, StreamItemsView, StreamTemplate) {
    'use strict';
    
    var StreamView = Backbone.Marionette.LayoutView.extend({
        id: 'stream',
        className: 'column u-flex--column u-flex--full',
        template: _.template(StreamTemplate),

        regions: {
            clearStreamButtonRegion: '#stream-clearStreamButtonRegion',
            radioButtonRegion: '#stream-radioButtonRegion',
            repeatButtonRegion: '#stream-repeatButtonRegion',
            saveStreamButtonRegion: '#stream-saveStreamButtonRegion',
            shuffleButtonRegion: '#stream-shuffleButtonRegion',
            streamItemsRegion: '#stream-streamItemsRegion'
        },
        
        streamItems: null,
        
        initialize: function () {
            this.streamItems = Streamus.backgroundPage.stream.get('items');
        },
        
        onShow: function () {
            this.shuffleButtonRegion.show(new ShuffleButtonView({
                model: Streamus.backgroundPage.shuffleButton
            }));
            
            this.repeatButtonRegion.show(new RepeatButtonView({
                model: Streamus.backgroundPage.repeatButton
            }));
            
            this.radioButtonRegion.show(new RadioButtonView({
                model: Streamus.backgroundPage.radioButton
            }));
            
            this.clearStreamButtonRegion.show(new ClearStreamButtonView({
                model: new ClearStreamButton({
                    streamItems: this.streamItems
                })
            }));
            
            this.saveStreamButtonRegion.show(new SaveStreamButtonView({
                model: new SaveStreamButton({
                    streamItems: this.streamItems,
                    signInManager: Streamus.backgroundPage.signInManager
                })
            }));
            
            //  IMPORTANT: This needs to be appended LAST because flexbox calculations require everything to be in place.
            this.streamItemsRegion.show(new StreamItemsView({
                collection: this.streamItems
            }));
        }
    });

    return StreamView;
});