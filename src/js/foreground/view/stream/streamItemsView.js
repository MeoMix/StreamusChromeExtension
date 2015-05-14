define(function(require) {
    'use strict';

    var ListItemType = require('common/enum/listItemType');
    var CollectionViewMultiSelect = require('foreground/view/behavior/collectionViewMultiSelect');
    var Scrollable = require('foreground/view/behavior/scrollable');
    var SlidingRender = require('foreground/view/behavior/slidingRender');
    var Sortable = require('foreground/view/behavior/sortable');
    var Tooltipable = require('foreground/view/behavior/tooltipable');
    var StreamItemView = require('foreground/view/stream/streamItemView');
    var StreamItemsTemplate = require('text!template/stream/streamItems.html');

    var StreamItemsView = Marionette.CompositeView.extend({
        id: 'streamItems',
        className: 'list u-flex--full u-bordered--left',
        childViewContainer: '@ui.childContainer',
        childView: StreamItemView,
        childViewType: ListItemType.StreamItem,
        childViewOptions: function() {
            return {
                type: this.childViewType,
                parentId: this.ui.childContainer[0].id
            };
        },

        //  Overwrite resortView to only render children as expected
        resortView: function() {
            this._renderChildren();
        },

        template: _.template(StreamItemsTemplate),

        ui: function() {
            return {
                //  TODO: This has to be named generic for Sortable/SlidingRender behaviors. See issue here: https://github.com/marionettejs/backbone.marionette/issues/1909
                childContainer: '#' + this.id + '-listItems'
            };
        },

        behaviors: {
            CollectionViewMultiSelect: {
                behaviorClass: CollectionViewMultiSelect
            },
            Scrollable: {
                behaviorClass: Scrollable,
                implementsSlidingRender: true
            },
            SlidingRender: {
                behaviorClass: SlidingRender
            },
            Sortable: {
                behaviorClass: Sortable
            },
            Tooltipable: {
                behaviorClass: Tooltipable
            }
        },

        activeStreamItemAreaEvents: {
            'beforeVisible': '_onActiveStreamItemAreaBeforeVisible',
            'visible': '_onActiveStreamItemAreaVisible',
            'hidden': '_onActiveStreamItemAreaHidden'
        },

        initialize: function() {
            this.bindEntityEvents(Streamus.channels.activeStreamItemArea.vent, this.activeStreamItemAreaEvents);
        },

        _onActiveStreamItemAreaBeforeVisible: function() {
            //  ChildContainer's height isn't updated until ItemViews inside it are rendered which is just after the ActiveStreamItemArea is about to be visible.
            setTimeout(function() {
                //  If the content isn't going to have a scrollbar later then add a class to ensure that 
                //  a scrollbar doesn't shown for a second as the content transitions in.
                if (this.ui.childContainer.height() <= this.$el.height()) {
                    this.ui.childContainer.addClass('is-heightRestricted');
                }
            }.bind(this));
        },

        _onActiveStreamItemAreaVisible: function() {
            this.ui.childContainer.removeClass('is-heightRestricted');
            this.triggerMethod('ListHeightUpdated');
        },

        _onActiveStreamItemAreaHidden: function() {
            this.triggerMethod('ListHeightUpdated');
        }
    });

    return StreamItemsView;
});