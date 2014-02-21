define([
], function () {
    'use strict';

    var StreamusCompositeView = Backbone.Marionette.CompositeView.extend({
        isFullyVisible: false,
        
        onFullyVisible: function () {
            if (_.isUndefined(this.ui.itemContainer))
                throw "itemContainer is undefined";

            $(this.children.map(function (child) {
                return child.ui.imageThumbnail.toArray();
            })).lazyload({
                container: this.ui.itemContainer,
                threshold: 250
            });

            this.isFullyVisible = true;
        },
        
        onAfterItemAdded: function (view) {
            if (this.isFullyVisible) {
                view.ui.imageThumbnail.lazyload({
                    container: this.ui.itemContainer,
                    threshold: 250
                });
            }
        }

    });

    return StreamusCompositeView;
});