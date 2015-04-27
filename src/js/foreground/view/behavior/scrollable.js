define(function() {
    'use strict';

    var Scrollable = Marionette.Behavior.extend({
        defaults: {
            //  The SlidingRender behavior modifies CollectionView functionality drastically.
            //  It will trigger OnUpdateScrollbar events when it needs the scrollbar updated.
            implementsSlidingRender: false
        },

        onAttach: function() {
            //  More info: https://github.com/noraesae/perfect-scrollbar
            //  This needs to be ran during onAttach for perfectScrollbar to do its math properly.
            this.$el.perfectScrollbar({
                suppressScrollX: true,
                //  48px because that is the min hit target for a button suggested by Google's design docs.
                //  So, I figure it's also an ideal minimum size for clicking on a scrollbar.
                minScrollbarLength: 48,
                includePadding: true
            });
        },

        onUpdateScrollbar: function() {
            this._updateScrollbar();
        },

        //  TODO: This wouldn't be necessary (and bad) if I calculate the height of the view before sliding it out and use transforms.
        onListHeightUpdated: function() {
            requestAnimationFrame(this._updateScrollbar.bind(this));
        },

        onAddChild: function() {
            if (!this.options.implementsSlidingRender) {
                this._updateScrollbar();
            }
        },

        onRemoveChild: function() {
            if (!this.options.implementsSlidingRender) {
                this._updateScrollbar();
            }
        },

        _updateScrollbar: function() {
            //  When the CollectionView is first initializing _updateScrollbar can fire before perfectScrollbar has been initialized.
            if (this.view._isShown) {
                this.$el.perfectScrollbar('update');
            }
        }
    });

    return Scrollable;
});