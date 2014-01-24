define([
    'foreground/view/genericForegroundView',
    'foreground/view/activePlaylistArea/playlistItemView',
    'foreground/view/rightPane/stream/streamItemView',
    'foreground/view/videoSearch/videoSearchResultView',
    'enum/listItemType',
    'foreground/collection/streamItems'
], function (GenericForegroundView, PlaylistItemView, StreamItemView, VideoSearchResultView, ListItemType, StreamItems) {
    'use strict';

    var MultiSelectView = GenericForegroundView.extend({
        
        events: {
            'click .listItem': 'setSelectedOnClick'
        },
        
        render: function() {
            
            var self = this;
            
            //  Allows for drag-and-drop of videos
            this.$el.sortable({

                connectWith: '.droppable-list',

                cursorAt: {
                    right: 35,
                    bottom: 40
                },

                placeholder: 'sortable-placeholder listItem hiddenUntilChange',

                helper: function (ui, listItem) {

                    //  Create a new view instead of just copying the HTML in order to preserve HTML->Backbone.View relationship
                    var copyHelperView;
                    var viewOptions = {
                        model: self.model.get(listItem.data('id')),
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
                    console.log("CHANGE FIRED");
                    //  TODO: This doesn't seem to be working reliably. :(
                    //  There's a CSS redraw issue with my CSS selector: .listItem.copyHelper + .sortable-placeholder 
                    //  So, I manually hide the placehelper (like it would be normally) until a change occurs -- then the CSS can take over.
                    $('.hiddenUntilChange').removeClass('hiddenUntilChange');
                },
                start: function (event, ui) {
  
                    var modelToSelect = self.model.get(ui.item.data('id'));

                    self.doSetSelected({
                        modelToSelect: modelToSelect,
                        drag: true
                    });

                    this.selectedItems = self.$el.find('.selected');

                    this.selectedItems.css({
                        opacity: '.5'
                    });

                    //  Set it here not in helper because dragStart may select a search result.
                    ui.helper.text(self.model.selected().length);                    
                    
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
                    }

                    this.selectedItems.css({
                        opacity: '1'
                    });

                    this.copyHelper = null;
                    this.backCopyHelper = null;
                    this.selectedItems = null;

                    //  Don't allow VideoSearchResults to be sorted -- copied is true when it moves to StreamItems.
                    //  Returning false cancels the sort.
                    return copied || !(ui.item.data('type') === ListItemType.VideoSearchResult);
                },

                tolerance: 'pointer',
                receive: function (event, ui) {
                    var listItemType = ui.item.data('type');

                    if (listItemType === ListItemType.StreamItem) {

                        var streamItemId = ui.item.data('id');
                        var draggedStreamItem = StreamItems.get(streamItemId);

                        //  Remove blue coloring if visible before waiting for addVideo to finish to give a more seamless swap to the new item.
                        ui.item.removeClass('selected');

                        //  Don't allow duplicates
                        var itemAlreadyExists = self.model.itemAlreadyExists(draggedStreamItem);

                        if (itemAlreadyExists) {
                            ui.item.remove();
                        }
                        else {
                            
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
                    } else {
                        console.error('Unsupported.');
                    }

                    ui.sender.data('copied', true);
                },

                //  Whenever a video row is moved inform the Player of the new video list order
                update: function (event, ui) {

                    var listItemId = ui.item.data('id');
                    var listItemType = ui.item.data('type');

                    //  TODO: This needs to be made generic if I'm going to support StreamItems too.
                    //  Don't run this code when handling stream items -- only when reorganizing playlist items.
                    if (listItemType === ListItemType.PlaylistItem) {
                        //  It's important to do this to make sure I don't count my helper elements in index.
                        var index = parseInt(ui.item.parent().children('.listItem').index(ui.item));
                        self.model.moveToIndex(listItemId, index);
                    }
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
            var modelToSelect = this.model.get(id);

            console.log("setSelectedOnClick is running", modelToSelect);

            this.doSetSelected({
                shiftKey: event.shiftKey,
                ctrlKey: event.ctrlKey,
                modelToSelect: modelToSelect
            });

        },

        doSetSelected: function (options) {
            var modelToSelect = options.modelToSelect;

            console.log("modelToSelect:", modelToSelect);

            var shiftKeyPressed = options.shiftKey || false;
            var ctrlKeyPressed = options.ctrlKey || false;
            var isDrag = options.drag || false;

            var targetAlreadySelected = modelToSelect.get('selected');

            //  A dragged item is always selected.
            modelToSelect.set('selected', !targetAlreadySelected || isDrag);

            //  When the shift key is pressed - select a block of search result items
            if (shiftKeyPressed) {

                var firstSelectedIndex = 0;
                var selectedIndex = this.model.indexOf(modelToSelect);

                //  If the first item is being selected with shift held -- firstSelectedIndex isn't used and selection goes from the top.
                if (this.model.selected().length > 1) {
                    //  Get the search result which was selected first and go from its index.
                    firstSelectedIndex = this.model.indexOf(this.model.firstSelected());
                }

                //  Select all items between the selected item and the firstSelected item.
                this.model.each(function (model, index) {
                    var isBetweenAbove = index <= selectedIndex && index >= firstSelectedIndex;
                    var isBetweenBelow = index >= selectedIndex && index <= firstSelectedIndex;

                    model.set('selected', isBetweenBelow || isBetweenAbove);
                });

            } else if (ctrlKeyPressed) {
                //  Using the ctrl key to select an item resets firstSelect (which is a special scenario)
                //  but doesn't lose the other selected items.
                modelToSelect.set('firstSelected', true);
            } else if (!isDrag || (isDrag && !targetAlreadySelected)) {
                //  All other selections are lost if the control key is not held when a click occurs.
                this.model.deselectAllExcept(modelToSelect.cid);
            }
        }
    });

    return MultiSelectView;
});