define([
    'foreground/view/streamusCompositeView',
    'foreground/view/leftBasePane/playlistItemView',
    'foreground/view/rightBasePane/streamItemView',
    'foreground/view/videoSearch/videoSearchResultView',
    'common/enum/listItemType',
    'background/collection/streamItems'
], function (StreamusCompositeView, PlaylistItemView, StreamItemView, VideoSearchResultView, ListItemType, StreamItems) {
    'use strict';

    var MultiSelectCompositeView = StreamusCompositeView.extend({

        events: {
            'click .listItem': 'setSelectedOnClick'
        },

        onRender: function () {
            var self = this;

            //  Allows for drag-and-drop of videos
            this.$el.find(this.itemViewContainer).sortable({

                connectWith: '.droppable-list',

                cursorAt: {
                    right: 35,
                    bottom: 40
                },
                
                //  Adding a delay helps preventing unwanted drags when clicking on an element.
                delay: 100,

                placeholder: 'sortable-placeholder listItem hiddenUntilChange',

                helper: function (ui, listItem) {

                    console.log("listItem id:", listItem, listItem.data('id'));

                    //  Create a new view instead of just copying the HTML in order to preserve HTML->Backbone.View relationship
                    var copyHelperView;
                    var viewOptions = {
                        model: self.collection.get(listItem.data('id')),
                        //  Don't lazy-load the view because copy helper is clearly visible
                        instant: true
                    };

                    var listItemType = listItem.data('type');

                    switch (listItemType) {
                        case ListItemType.PlaylistItem:
                            copyHelperView = new PlaylistItemView(viewOptions);
                            break;
                        case ListItemType.StreamItem:
                            copyHelperView = new StreamItemView(viewOptions);
                            break;
                        case ListItemType.VideoSearchResult:
                            copyHelperView = new VideoSearchResultView(viewOptions);
                            break;
                        default:
                            throw 'Unhandled ListItemType: ' + listItemType;
                    }

                    this.copyHelper = copyHelperView.render().$el.insertAfter(listItem);
                    this.copyHelper.addClass('copyHelper');

                    this.backCopyHelper = listItem.prev();
                    this.backCopyHelper.addClass('copyHelper');

                    $(this).data('copied', false);

                    return $('<span>', {
                        'class': 'selectedModelsLength'
                    });
                },
                change: function () {
                    //  There's a CSS redraw issue with my CSS selector: .listItem.copyHelper + .sortable-placeholder 
                    //  So, I manually hide the placehelper (like it would be normally) until a change occurs -- then the CSS can take over.
                    $('.hiddenUntilChange').removeClass('hiddenUntilChange');
                },
                start: function (event, ui) {

                    var modelToSelect = self.collection.get(ui.item.data('id'));

                    self.doSetSelected({
                        modelToSelect: modelToSelect,
                        drag: true
                    });

                    this.selectedItems = self.$el.find('.selected');

                    this.selectedItems.css({
                        opacity: '.5'
                    });

                    //  Set it here not in helper because dragStart may select a search result.
                    ui.helper.text(self.collection.selected().length);

                    ui.item.data('sortableItem').scrollParent = ui.placeholder.parent();
                    ui.item.data('sortableItem').overflowOffset = ui.placeholder.parent().offset();
                },

                stop: function (event, ui) {

                    this.backCopyHelper.removeClass('copyHelper');

                    var copied = $(this).data('copied');
                    if (copied) {
                        this.copyHelper.removeClass('copyHelper');
                    }
                    else {
                        this.copyHelper.remove();
                        
                        //  Whenever a PlaylistItem row is reorganized -- inform the Player of the new order
                        var listItemType = ui.item.data('type');
                        if (listItemType === ListItemType.PlaylistItem) {
                            self.collection.moveToIndex(ui.item.data('id'), ui.item.index());
                        }
                    }

                    this.selectedItems.css({
                        opacity: '1'
                    });

                    this.copyHelper = null;
                    this.backCopyHelper = null;
                    this.selectedItems = null;

                    //  Don't allow VideoSearchResults to be sorted -- copied is true when it moves to StreamItems.
                    //  Returning false cancels the sort.
                    var isVideoSearchResult = ui.item.data('type') === ListItemType.VideoSearchResult;

                    return copied || !isVideoSearchResult;
                },

                tolerance: 'pointer',
                receive: function (event, ui) {
                    //  Don't allow receiving until collection is given because there shouldn't be anything to drop onto
                    if (_.isUndefined(self.collection)) {
                        ui.item.remove();
                        //  Set copied to true so that the item stays where it is.
                        ui.sender.data('copied', true);
                        return;
                    }

                    var listItemType = ui.item.data('type');

                    if (listItemType === ListItemType.StreamItem) {

                        var streamItemId = ui.item.data('id');
                        var draggedStreamItem = StreamItems.get(streamItemId);

                        //  Remove blue coloring if visible before waiting for addVideo to finish to give a more seamless swap to the new item.
                        ui.item.removeClass('selected');

                        //  Don't allow duplicates
                        var videoAlreadyExists = self.collection.videoAlreadyExists(draggedStreamItem.get('video'));

                        if (videoAlreadyExists) {
                            ui.item.remove();
                        }
                        else {

                            //  TODO: I need to indicate that an item is being saved to the server w/ a spinner + loading message.
                            self.model.addByVideoAtIndex(draggedStreamItem.get('video'), ui.item.index(), function () {
                                //  Remove item because it's a stream item and I've just added a playlist item at that index.
                                ui.item.remove();
                            });

                            //  TODO: There's a bit of lag which happens while waiting for the add event to propagate to the parent.
                            //  This makes Streamus seem unresponsive but this is clearly an encapsulation break... need to fix!
                            var emptyPlaylistMessage = $('.playlistEmpty');
                            if (emptyPlaylistMessage.length > 0) {
                                emptyPlaylistMessage.addClass('hidden');
                            }
                        }
                    }

                    ui.sender.data('copied', true);
                },

                over: function (event, ui) {
                    ui.item.data('sortableItem').scrollParent = ui.placeholder.parent();
                    ui.item.data('sortableItem').overflowOffset = ui.placeholder.parent().offset();
                }
            });

            return this;
        },

        setSelectedOnClick: function (event) {

            var id = $(event.currentTarget).data('id');
            var modelToSelect = this.collection.get(id);

            this.doSetSelected({
                shiftKey: event.shiftKey,
                ctrlKey: event.ctrlKey,
                modelToSelect: modelToSelect
            });

        },

        doSetSelected: function (options) {
            var modelToSelect = options.modelToSelect;

            var shiftKeyPressed = options.shiftKey || false;
            var ctrlKeyPressed = options.ctrlKey || false;
            var isDrag = options.drag || false;

            var isSelectedAlready = modelToSelect.get('selected');

            modelToSelect.set('selected', (ctrlKeyPressed && isSelectedAlready) ? false : true);

            //  When the shift key is pressed - select a block of search result items
            if (shiftKeyPressed) {

                var firstSelectedIndex = 0;
                var selectedIndex = this.collection.indexOf(modelToSelect);

                //  If the first item is being selected with shift held -- firstSelectedIndex isn't used and selection goes from the top.
                if (this.collection.selected().length > 1) {
                    //  Get the search result which was selected first and go from its index.
                    firstSelectedIndex = this.collection.indexOf(this.collection.firstSelected());
                }

                //  Select all items between the selected item and the firstSelected item.
                this.collection.each(function (model, index) {
                    var isBetweenAbove = index <= selectedIndex && index >= firstSelectedIndex;
                    var isBetweenBelow = index >= selectedIndex && index <= firstSelectedIndex;

                    model.set('selected', isBetweenBelow || isBetweenAbove);
                });

            } else if (ctrlKeyPressed) {
                //  Using the ctrl key to select an item resets firstSelect (which is a special scenario)
                //  but doesn't lose the other selected items.
                modelToSelect.set('firstSelected', true);
            } else if (!(isDrag && isSelectedAlready)) {
                //  All other selections are lost unless dragging a group of items.
                this.collection.deselectAllExcept(modelToSelect);
            }
        },
        
        //  TODO: This adds support for a sorted collection, but is slower than using the default implementation which leverages a document fragment.
        //  https://github.com/marionettejs/backbone.marionette/wiki/Adding-support-for-sorted-collections
        //  https://github.com/marionettejs/backbone.marionette/blob/master/docs/marionette.collectionview.md#collectionviews-appendhtml
        appendHtml: function (collectionView, itemView, index) {
            var childrenContainer = collectionView.itemViewContainer ? collectionView.$(collectionView.itemViewContainer) : collectionView.$el;
            var children = childrenContainer.children();
            if (children.size() <= index) {
                childrenContainer.append(itemView.el);
            } else {
                children.eq(index).before(itemView.el);
            }
        }
    });

    return MultiSelectCompositeView;
});