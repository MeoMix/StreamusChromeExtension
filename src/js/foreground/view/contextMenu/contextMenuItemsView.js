define(function(require) {
    'use strict';

    var ContextMenuItemView = require('foreground/view/contextMenu/contextMenuItemView');

    var ContextMenuItemsView = Marionette.CollectionView.extend({
        tagName: 'ul',
        childView: ContextMenuItemView
    });

    return ContextMenuItemsView;
});