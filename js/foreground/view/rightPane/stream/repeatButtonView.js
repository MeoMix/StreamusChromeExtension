define([
    'repeatButtonState',
    'text!../template/repeatButton.htm'
], function (RepeatButtonState, RepeatButtonTemplate) {
    'use strict';

    var RepeatButtonView = Backbone.View.extend({
        
        tagName: 'button',

        className: 'button-icon button-small',
        
        template: _.template(RepeatButtonTemplate),

        events: {
            'click': 'toggleRepeat'
        },
        
        disabledTitle: chrome.i18n.getMessage('repeatDisabled'),
        repeatVideoTitle: chrome.i18n.getMessage('repeatVideo'),
        repeatStreamTitle: chrome.i18n.getMessage('repeatStream'),
        
        render: function () {
            this.$el.html(this.template(_.extend(this.model.toJSON(), {
                //  mixin the enum to be able to use it in templating
                'RepeatButtonState': RepeatButtonState 
            })));

            var state = this.model.get('state');
            
            //  The button is considered enabled if it is anything but disabled.
            this.$el.toggleClass('enabled', state !== RepeatButtonState.DISABLED);

            switch (state) {
                case RepeatButtonState.DISABLED:
                    this.$el.attr('title', this.disabledTitle);
                    break;
                case RepeatButtonState.REPEAT_VIDEO:
                    this.$el.attr('title', this.repeatVideoTitle);
                    break;
                case RepeatButtonState.REPEAT_STREAM:
                    this.$el.attr('title', this.repeatStreamTitle);
                    break;
                default:
                    console.error('Unhandled repeatButtonState:', state);
                    break;
            }

            return this;
        },
        
        initialize: function () {
            this.listenTo(this.model, 'change:state', this.render);
        },
        
        toggleRepeat: function () {
            this.model.toggleRepeat();
        }
    });

    return RepeatButtonView;
});