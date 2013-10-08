define([
    'streamItems',
    'streamItemView',
    'text!../template/streamView.htm',
    'contextMenuView',
    'utility',
    'sly'
], function (StreamItems, StreamItemView, StreamViewTemplate, ContextMenuView, Utility) {
    'use strict';
    
    var StreamView = Backbone.View.extend({
        
        className: 'streamView list',
        
        template: _.template(StreamViewTemplate),
        
        //slidee: $('#StreamView ul.slidee'),
        
        events: {
            'contextmenu': 'showContextMenu',
        },
        
        //sly: null,
        //overlay: $('#StreamView .overlay'),

        initialize: function () {
            var self = this;

            //  Setting it here so I can use internationalization... could probably do it in a template more cleanly though.
            //this.overlay.text(chrome.i18n.getMessage("noVideosInStream"));

            //  Need to do it this way to support i18n
            //this.overlay.css({
            //    'margin-left': -1 * this.overlay.width() / 2
            //});

            // Call Sly on frame
            //this.sly = new window.Sly(this.$el, {
            //    horizontal: 1,
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
			//	scrollBy: 1
            //}, {
            //    //  This is a pretty costly function because it fires so often. Use native javascript.
            //    move: _.throttle(function() {
 
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
                    self.addItem(StreamItems.at(0), true);
                } else {
                    self.addItems(StreamItems.models, true);
                }

                //  Ensure proper item is selected.
                //var selectedStreamItem = StreamItems.getSelectedItem();
                //var selectedItemIndex = StreamItems.indexOf(selectedStreamItem);

                //this.sly.activate(selectedItemIndex, true);
            }

            //  Whenever an item is added to the collection, visually add an item, too.
            this.listenTo(StreamItems, 'add', this.addItem);
            this.listenTo(StreamItems, 'addMultiple', this.addItems);
            this.listenTo(StreamItems, 'change:selected', this.selectItem);

            //this.listenTo(StreamItems, 'empty', function () {
            //    this.overlay.show();
            //});

            //this.listenTo(StreamItems, 'remove empty', this.sly.reload);
            
            Utility.scrollChildElements(this.el, '.videoTitle');
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
                container: this.$el,
                event: 'visible'
            });
            
            if (streamItem.get('selected')) {
                this.selectItem(streamItem);
            }

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
            
            this.sly.add(elements);

            if (streamItems.length === StreamItems.length) {
                this.sly.activate(0);
                
                //  TODO: This fixes some odd padding issue with slyjs on the first item being added. Not sure why add doesn't fix it? 
                this.sly.reload();
            }

            $(elements).find('img.lazy').lazyload({
                effect: 'fadeIn',
                container: self.$el,
                event: 'visible'
            });

            this.overlay.hide();
        },
        
        selectItem: function (streamItem) {
            //this.sly.activate(StreamItems.indexOf(streamItem));
        },
        
        clear: function () {
            StreamItems.clear();
            this.slidee.empty();
            this.sly.reload();
        },

        showContextMenu: function (event) {
            var self = this;

            var isClearStreamDisabled = StreamItems.length === 0;

            ContextMenuView.addGroup({
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

            ContextMenuView.show({
                top: event.pageY,
                left: event.pageX + 1
            });

            return false;
        },

        changeModel: function (newModel) {
            this.model = newModel;
        }

    });

    return StreamView;
});