define([
], function() {
    'use strict';

    var ContextMenuItemView = Backbone.Marionette.ItemView.extend({
        
        tagName: 'li',
        
        ui: {
            
        },
        
        onRender: function() {
            this.setState();
        },
        
        setState: function() {
            this.$el.toggleClass('disabled', this.model.get('disabled'));
        }

    });

    return ContextMenuItemView;
})