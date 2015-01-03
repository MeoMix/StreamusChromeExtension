define([
    'text!template/element/simpleMenuItem.html'
], function (SimpleMenuItemTemplate) {
    'use strict';

    var SimpleMenuItemView = Marionette.LayoutView.extend({
        className: 'listItem listItem--small listItem--selectable',
        template: _.template(SimpleMenuItemTemplate),
        
        events: {
            'click': '_onClick'
        },
        
        _onClick: function() {
            this.model.set('selected', true);
        }
    });

    return SimpleMenuItemView;
});