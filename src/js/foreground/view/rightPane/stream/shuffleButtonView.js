define([
   'foreground/view/genericForegroundView',
    'text!template/shuffleButton.html'
], function (GenericForegroundView, ShuffleButtonTemplate) {
    'use strict';

    var ShuffleButtonView = GenericForegroundView.extend({

        tagName: 'button',

        className: 'button-icon button-small',
                                
        template: _.template(ShuffleButtonTemplate),
        
        events: {
            'click': 'toggleShuffle'
        },
        
        model: chrome.extension.getBackgroundPage().ShuffleButton,
        
        enabledTitle: chrome.i18n.getMessage('shuffleEnabled'),
        disabledTitle: chrome.i18n.getMessage('shuffleDisabled'),

        render: function () {
            this.$el.html(this.template(this.model.toJSON()));

            var enabled = this.model.get('enabled');
            this.$el.toggleClass('enabled', enabled);

            if (enabled) {
                this.$el.attr('title', this.enabledTitle);
            } else {
                this.$el.attr('title', this.disabledTitle);
            }

            return this;
        },
        
        initialize: function () {
            this.listenTo(this.model, 'change:enabled', this.render);
        },
        
        toggleShuffle: function () {
            this.model.toggleEnabled();
        }
        
    });
    
    return ShuffleButtonView;
});