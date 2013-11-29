define([
    'text!../template/addAllButton.htm',
    'streamItems'
], function (AddAllButtonTemplate, StreamItems) {
    'use strict';

    var AddAllButtonView = Backbone.View.extend({

        tagName: 'button',

        className: 'button-label addAll',
                                
        template: _.template(AddAllButtonTemplate),

        enabledTitle: chrome.i18n.getMessage("addAll"),
        disabledTitle: chrome.i18n.getMessage("addAllDisabled"),
        
        events: {
            'click': 'addToStream'
        },

        render: function () {
            this.$el.html(this.template());

            var disabled = this.model.get('items').length === 0;

            this.$el.prop('disabled', disabled);

            if (disabled) {
                this.$el.attr('title', this.disabledTitle);
            } else {
                this.$el.attr('title', this.enabledTitle);
            }

            return this;
        },
        
        initialize: function () {
            this.listenTo(this.model.get('items'), 'add addMultiple remove empty', this.render);
        },
        
        addToStream: function () {
            StreamItems.addByPlaylist(this.model, false);
        }
        
    });
    
    return AddAllButtonView;
});