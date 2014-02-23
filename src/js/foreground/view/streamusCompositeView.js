define([
], function () {
    'use strict';

    var StreamusCompositeView = Backbone.Marionette.CompositeView.extend({
        isFullyVisible: false,
        
        //  TODO: I might be able to make my life easier by making lazyload only check for either side visible.
        //  Tell images that they're able to bind lazyLoading functionality only once fully visible because when they're sliding in you're unable to tell if they're visible in one direction.
        //  But, I guess you know that direction is going to be loaded, so maybe it's fine to only check one direction?
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