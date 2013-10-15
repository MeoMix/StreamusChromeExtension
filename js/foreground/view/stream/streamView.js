define([
    'streamItems',
    'streamItemView',
    'text!../template/streamView.htm',
    'contextMenuGroups',
    'utility'
], function (StreamItems, StreamItemView, StreamViewTemplate, ContextMenuGroups, Utility) {
    'use strict';
    
    var StreamView = Backbone.View.extend({
        
        className: 'streamView list frame',
        
        template: _.template(StreamViewTemplate),
        
        events: {
            'contextmenu': 'showContextMenu',
        },
        
        render: function () {
            this.$el.html(this.template(this.model.toJSON()));
             
            //this.slidee = this.$el.children('ul.slidee');

            // Call Sly on frame
            //this.sly = new window.Sly(this.$el, {
            //    horizontal: 0,
            //    itemNav: 'centered',
            //    smart: 1,
            //    activateOn: 'click',
            //    mouseDragging: 1,
            //    touchDragging: 1,
            //    releaseSwing: 1,
            //    startAt: 3,
            //    speed: 300,
            //    elasticBounds: 1,
            //    easing: 'easeOutExpo',
            //    clickBar: 1,
            //    scrollBy: 1
            //}, {
            //    //  This is a pretty costly function because it fires so often. Use native javascript.
            //    move: _.throttle(function () {

            //        var unloadedImgElements = self.$el.find('img.lazy[src=""]');

            //        //  Find images which haven't been lazily loaded, but are in the viewport and trigger an event to get them to load.
            //        for (var i = 0; i < unloadedImgElements.length; i++) {
            //            var unloadedImgElement = unloadedImgElements[i];

            //            var rectangle = unloadedImgElement.getBoundingClientRect();

            //            var isInViewportLeftSide = rectangle.right >= 0 && rectangle.right <= self.$el.width();
            //            var isInViewportRightSide = rectangle.left >= 0 && rectangle.left <= self.$el.width();

            //            if (isInViewportRightSide || isInViewportLeftSide) {
            //                $(unloadedImgElement).trigger('visible');
            //            }

            //        }

            //    }, 300)
            //}).init();
            
            if (StreamItems.length > 0) {
                
                if (StreamItems.length === 1) {
                    this.addItem(StreamItems.at(0), true);
                } else {
                    this.addItems(StreamItems.models, true);

                    
                }


                var selectedStreamItem = this.$el.find('.streamItem.selected');
                console.log("item:", selectedStreamItem, selectedStreamItem.isOutOfView());
                selectedStreamItem.scrollIntoView();
            }

            

            return this;

        },

        initialize: function () {

            //  Whenever an item is added to the collection, visually add an item, too.
            this.listenTo(StreamItems, 'add', this.addItem);
            this.listenTo(StreamItems, 'addMultiple', this.addItems);

            this.listenTo(StreamItems, 'remove empty', this.reload);
            
            Utility.scrollChildElements(this.el, '.item-title');
        },
        
        reload: function () {
            //this.sly.reload();
        },
        
        addItem: function (streamItem) {

            console.log("Adding streamItem:", streamItem);

            var streamItemView = new StreamItemView({
                model: streamItem,
                parent: this
            });

            var element = streamItemView.render().el;
            //this.sly.add(element);
            this.$el.append(element);

            $(element).find('img.lazy').lazyload({
                effect: 'fadeIn',
                container: this.$el
            });
            
            //  TODO: This fixes some odd padding issue with slyjs on the first item being added. Not sure why add doesn't fix it? 
            //  Re-opening the player and calling this same method works fine..
            //this.sly.reload();
            //this.overlay.hide();
            
            //this.sly.toEnd();

        },
        
        addItems: function (streamItems) {

            var self = this;
            var streamItemViews = _.map(streamItems, function(streamItem) {

                return new StreamItemView({
                    model: streamItem,
                    parent: self
                });

            });

            var elements = _.map(streamItemViews, function (streamItemView) {
                return streamItemView.render().el;
            });

            this.$el.append(elements);
            
            //this.sly.add(elements);

            //if (streamItems.length === StreamItems.length) {
            //    this.sly.activate(0);
                
            //    //  TODO: This fixes some odd padding issue with slyjs on the first item being added. Not sure why add doesn't fix it? 
            //    this.sly.reload();
            //}

            $(elements).find('img.lazy').lazyload({
                effect: 'fadeIn',
                container: self.$el
            });

            //this.overlay.hide();
        },
        
        clear: function () {
            console.log("Clearing");
            StreamItems.clear();
            //this.slidee.empty();
            //this.sly.reload();
        },

        showContextMenu: function (event) {

            //  Whenever a context menu is shown -- set preventDefault to true to let foreground know to not reset the context menu.
            event.preventDefault();

            if (event.target === event.currentTarget) {
                //  Didn't bubble up from a child -- clear groups.
                ContextMenuGroups.reset();
            }
            
            var self = this;

            var isClearStreamDisabled = StreamItems.length === 0;

            ContextMenuGroups.add({
                position: 1,
                items: [{
                    position: 0,
                    text: chrome.i18n.getMessage("clearStream"),
                    title: isClearStreamDisabled ? chrome.i18n.getMessage('noClearStreamWarning') : '',
                    disabled: isClearStreamDisabled,
                    onClick: function () {

                        if (!isClearStreamDisabled) {
                            self.clear();
                        }
                        
                    }
                }, {
                    position: 1,
                    text: chrome.i18n.getMessage("saveStreamAsPlaylist"),
                    onClick: function () {
                        self.model.addPlaylistWithVideos('Playlist', StreamItems.pluck('video'));
                    }
                }]
            });

        }

    });

    return StreamView;
});