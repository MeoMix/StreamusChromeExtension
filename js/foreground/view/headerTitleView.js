//  Displays the currently playing playlistItem's title or a default welcome message.
define([
    'streamItems',
    'utility'
], function (StreamItems, Utility) {
    'use strict';

    var HeaderTitleView = Backbone.View.extend({
        
        el: $('#HeaderTitle'),
        
        render: function() {
          
            if (StreamItems.length == 0) {
                this.$el.text(chrome.i18n.getMessage("welcomeToStreamus"));
            } else {
                var selectedStreamItem = StreamItems.findWhere({ selected: true });
                this.$el.text(selectedStreamItem.get('title'));
            }

        },
        
        initialize: function () {
            Utility.scrollElementInsideParent(this.$el);
            this.listenTo(StreamItems, 'change:selected empty', this.render);
            this.render();
        }

    });

    return new HeaderTitleView;
});