define([
    'genericForegroundView',
    'contextMenuGroups',
    'text!../template/contextMenu.htm'
], function (GenericForegroundView, ContextMenuGroups, ContextMenuTemplate) {
    'use strict';

    //  A singleton view which is either displayed somewhere in body with groups of items or empty and hidden.
    var ContextMenuView = GenericForegroundView.extend({

        template: _.template(ContextMenuTemplate),

        events: {
            'click li': 'onItemClick',
        },
        
        attributes: {
            id: 'contextMenu'
        },

        render: function () {
            
            this.$el.html(this.template({
                contextMenuGroups: ContextMenuGroups
            }));

            //  Prevent display outside viewport.
            var offsetTop = this.top;
            var needsVerticalFlip = offsetTop + this.$el.height() > this.$el.parent().height();

            if (needsVerticalFlip) {
                offsetTop = offsetTop - this.$el.height();
            }

            var offsetLeft = this.left;
            var needsHorizontalFlip = offsetLeft + this.$el.width() > this.$el.parent().width();
            if (needsHorizontalFlip) {
                offsetLeft = offsetLeft - this.$el.width();
            }

            //  Show the element before setting offset to ensure correct positioning.
            this.$el.offset({
                top: offsetTop,
                left: offsetLeft
            });

            return this;
        },
        
        initialize: function () {
            this.listenTo(ContextMenuGroups, 'reset add remove', this.render);
        },
        
        //  Displays the context menu at given x,y coordinates.
        show: function (options) {
            if (options.top === undefined || options.left === undefined) throw "ContextMenu must be shown with top/left coordinates.";

            this.top = options.top;
            this.left = options.left;

            this.render();
        },

        //  Event that runs when any item in a group is clicked.
        //  Maps the click action to the related model's onClick event.
        onItemClick: function (event) {

            var clickGoupItemCid = $(event.currentTarget).find('a').attr('id');
            var clickGroupCid = $(event.target).closest('ul').attr('id');
            
            var clickedGroup = ContextMenuGroups.find(function (group) {
                return group.cid == clickGroupCid;
            });

            var clickedGroupItem = clickedGroup.get('items').find(function (item) {
                return item.cid == clickGoupItemCid;
            });
            
            clickedGroupItem.get('onClick')();
        }
    });

    return ContextMenuView;
});