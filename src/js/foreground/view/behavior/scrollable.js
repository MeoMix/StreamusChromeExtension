define(function() {
    'use strict';

    var Scrollable = Marionette.Behavior.extend({
        collectionEvents: {
            //  IMPORTANT: These method names are valid in Behavior but NOT in CompositeView or CollectionView; clashes with _onCollectionAdd and _onCollectionRemove in Marionette.
            'add': '_onCollectionAdd',
            'reset': '_onCollectionReset',
            'remove': '_onCollectionRemove'
        },

        initialize: function() {
            //  Throttle updating the scrollbar because many events can come in at once, but only need to reflect
            //  the final state / potentially small updates while events coming in.
            //  Bound in initialize because if bound on the class then all views which implement Scrollable will
            //  share the throttle timer.
            this._throttleUpdateScrollbar = _.throttle(this._updateScrollbar.bind(this), 20);
        },

        onAttach: function() {
            //  More info: https://github.com/noraesae/perfect-scrollbar
            //  This needs to be ran during onAttach for perfectScrollbar to do its math properly.
            this.$el.perfectScrollbar({
                suppressScrollX: true,
                //  56px because that is the height of 1 listItem--medium
                minScrollbarLength: 56,
                includePadding: true
            });

            //  When showing a SlidingRender collection which has an initial set of items,
            //  need to call update after setting up perfectScrollbar to ensure that initial load of items is parsed.
            _.defer(this._throttleUpdateScrollbar.bind(this));
        },

        onUpdateScrollbar: function() {
            this._throttleUpdateScrollbar();
        },

        _onCollectionAdd: function() {
            this._throttleUpdateScrollbar();
        },

        _onCollectionReset: function() {
            this._throttleUpdateScrollbar();
        },

        _onCollectionRemove: function() {
            //  TODO: This is poor design. How can I fix this?
            //  This needs to be deferred because SlidingRender's onCollectionRemove logic is deferred.
            _.defer(this._throttleUpdateScrollbar.bind(this));
        },

        _throttleUpdateScrollbar: null,

        _updateScrollbar: function() {
            //  When the CollectionView is first initializing _updateScrollbar can fire before perfectScrollbar has been initialized.
            if (this.view._isShown) {
                //  This needs to be deferred because _onCollection events fire before the view is added or removed.
                //  Don't bind to onChildAdd/onChildRemove because SlidingRender behavior doesn't run onChildAdd
                //  once an ItemView exceeds the threshold, but the scrollbar height still needs to be updated.
                //  Additionally, SlidingRender fires onChildAdd events when scrolling which causes lag when
                //  the scrollbar does not need to be updated.
                _.defer(function() {
                    this.$el.perfectScrollbar('update');
                }.bind(this));
            }
        }
    });

    return Scrollable;
});