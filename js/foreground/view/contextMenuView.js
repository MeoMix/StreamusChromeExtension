define([
    'contextMenu',
    'text!../templates/contextMenuTemplate.htm',
    'utility'
], function (ContextMenu, ContextMenuTemplate, Utility) {
    'use strict';

    //  A singleton view which is either displayed somewhere in body with groups of items or empty and hidden.
    var ContextMenuView = Backbone.View.extend({

        template: _.template(ContextMenuTemplate),

        events: {
            'click li': 'onItemClick',
        },
        
        attributes: {
            id: 'contextMenu'
        },

        model: new ContextMenu,
        
        render: function () {
            this.$el.html(this.template(this.model.toJSON()));

            this.$el.find('a').each(function () {
                Utility.scrollElementInsideParent(this);
            });

            //  TODO: Should this logic be part of 'show' or 'render' ?
            //  Prevent display outside viewport.
            var offsetTop = this.top;
            var needsVerticalFlip = offsetTop + this.$el.height() > this.$el.parent().height();

            console.log("This height and this parent height:", this.$el.height(), this.$el.parent().height());

            if (needsVerticalFlip) {
                console.log("needs vertical flip");
                offsetTop = offsetTop - this.$el.height();
            }

            var offsetLeft = this.left;
            var needsHorizontalFlip = offsetLeft + this.$el.width() > this.$el.parent().width();
            if (needsHorizontalFlip) {
                offsetLeft = offsetLeft - this.$el.width();
            }

            //  Show the element before setting offset to ensure correct positioning.
            this.$el.appendTo('body').offset({
                top: offsetTop,
                left: offsetLeft
            });
            
            return this;
        },

        addGroup: function (group) {
            //  Adding a group is an indication that the contextMenu is about to be re-rendered.
            //  Prepare the contextMenu for this by resetting it.
            if (this.$el.is(':visible')) {
                this.reset();
            }

            this.model.get('groups').add(group);
        },
        
        //  Hide the context menu and empty its displayed groups.
        reset: function () {
            console.log("Removing el", this.$el);
            this.$el.remove();
            this.model.get('groups').reset();
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
            
            var clickedGroup = this.model.get('groups').find(function (group) {
                return group.cid == clickGroupCid;
            });

            var clickedGroupItem = clickedGroup.get('items').find(function (item) {
                return item.cid == clickGoupItemCid;
            });

            // TODO: I don't really like how I'm invoking this event. I don't think the onClick should even be on the model.
            clickedGroupItem.get('onClick')();
        }
    });

    return new ContextMenuView;
});