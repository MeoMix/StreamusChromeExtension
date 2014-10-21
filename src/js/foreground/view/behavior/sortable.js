define([
    'common/enum/listItemType'
], function (ListItemType) {
    'use strict';

    var Sortable = Backbone.Marionette.Behavior.extend({
        placeholderClass: 'sortable-placeholder',
        isDraggingClass: 'is-dragging',
        
        ui: {
            list: '.list'
        },
        
        onRender: function () {
            this.view.ui.childContainer.sortable(this._getSortableOptions());
            
            //  Throttle the scroll event because scrolls can happen a lot and don't need to re-calculate very often.
            this.ui.list.scroll(_.throttle(function () {
                this.view.ui.childContainer.sortable('refresh');
            }.bind(this), 20));
        },
        
        _getSortableOptions: function() {
            var sortableOptions = {
                //  Append to body so that the placeholder appears above all other elements instead of under when dragging between regions.
                appendTo: 'body',
                connectWith: '.js-droppable',
                cursorAt: {
                    right: 35,
                    bottom: 40
                },
                //  Adding a delay helps preventing unwanted drags when clicking on an element.
                delay: 100,
                //  NOTE: THIS IS A CUSTOM MODIFICATION TO JQUERY UI. Prevent hiding dragged views.
                hideOnDrag: false,
                placeholder: this.placeholderClass + ' listItem listItem--medium hidden',
                helper: this._helper.bind(this),
                change: this._change.bind(this),
                start: this._start.bind(this),
                stop: this._stop.bind(this),
                tolerance: 'pointer',
                receive: this._receive.bind(this),
                over: this._over.bind(this),
                beforeStop: this._beforeStop.bind(this)
            };

            return sortableOptions;
        },
        
        _helper: function () {
            return $('<span>', {
                'class': 'sortable-selectedItemsCount'
            });
        },
        
        _change: function (event, ui) {
            var placeholderAdjacent = false;
            //  When dragging an element up/down its own list -- hide the sortable helper around the element being dragged.
            var draggedItems = this.view.collection.selected();
            //  Only disallow moving to adjacent location if dragging one item because that'd be a no-op.
            if (draggedItems.length === 1) {
                var draggedModelId = draggedItems[0].get('id');
                placeholderAdjacent = ui.placeholder.next().data('id') === draggedModelId || ui.placeholder.prev().data('id') === draggedModelId;
            }
            
            $('.' + this.placeholderClass).toggleClass('hidden', placeholderAdjacent);
        },
        
        _start: function (event, ui) {
            //  TODO: This won't be necessary if I change my logic to 'onMouseDown' instead of 'onClick'.
            this.view.triggerMethod('ItemDragged', this.view.collection.get(ui.item.data('id')));
            
            this.view.once('GetMinRenderIndexReponse', function (response) {
                this.originalPlaceholderIndex = ui.placeholder.index() + response.minRenderIndex;
            }.bind(this));
            this.view.triggerMethod('GetMinRenderIndex');

            //  Set helper text here, not in helper, because dragStart may select a search result.
            var selectedItems = this.view.collection.selected();
            ui.helper.text(selectedItems.length);

            var draggedSongs = _.map(selectedItems, function (item) {
                return item.get('song');
            });

            this.view.ui.childContainer.addClass(this.isDraggingClass).data({
                draggedSongs: draggedSongs,
                copied: false
            });

            this._overrideSortableItem(ui);
        },
        
        _beforeStop: function(event, ui) {
            this.view.once('GetMinRenderIndexReponse', function (response) {
                this.placeholderIndex = ui.placeholder.index() + response.minRenderIndex;
            }.bind(this));
            this.view.triggerMethod('GetMinRenderIndex');
        },
        
        _stop: function (event, ui) {
            var childContainer = this.view.ui.childContainer;
            //  The SearchResult view is not able to be moved so disable move logic for it.
            var allowMove = ui.item.data('type') !== ListItemType.SearchResult && !childContainer.data('copied');
            if (allowMove) {
                //  SUPER IMPORTANT: DO NOT REMOVE THIS SET TIMEOUT.
                //  _moveItems calls collection.sort but the list's height is still adjusting due to the placeholder being removed.
                //  sorting the collection will re-render the collectionview, but doing so while modifying the collections' height will break indices.
                setTimeout(this._moveItems.bind(this, this.view.collection.selected()));
            }
            
            childContainer.removeClass(this.isDraggingClass).removeData('draggedSongs copied');
            return allowMove;
        },
        
        _receive: function (event, ui) {
            this.view.once('GetMinRenderIndexReponse', function (response) {
                this.view.collection.addSongs(ui.sender.data('draggedSongs'), {
                    index: ui.item.index() + response.minRenderIndex
                });
                Streamus.channels.global.vent.trigger('itemsDropped');
            }.bind(this));
            this.view.triggerMethod('GetMinRenderIndex');
            
            ui.sender.data('copied', true);
        },
        
        _over: function (event, ui) {
            this._overrideSortableItem(ui);
            this._decoratePlaceholder(ui);
        },
        
        _moveItems: function (items) {
            //  TODO: MovedDown is broken when moving multiple items in some scenarios because some items might be moving up and others down.
            //  Always subtract one from placeholderIndex because it is the sibling of the actual item which means it's +1 index.
            //  When dragging an item down the list -- since the whole list shifts up 1 -- need to +1 the index which cancels out the -1.
            var movedDown = this.placeholderIndex > this.originalPlaceholderIndex;
            var index = movedDown ? this.placeholderIndex : this.placeholderIndex - 1;

            _.each(items, function (item) {
                var itemMoved = this.view.collection.moveToIndex(item.get('id'), index);
                //  TODO: I don't think this is 100% true -- it works but it's not correct because all being added at same 'index' but each one calculates their sequence appropriately.
                //  When moving a group of items down the list their indices will naturally work themselves out.
                if (!movedDown) {
                    index += 1;
                }
            }, this);
        },
        
        _decoratePlaceholder: function (ui) {
            var listItemType = ui.item.data('type');

            //  TODO: Also prevent dragging duplicates from Playlist/Search into Stream.
            if (listItemType === ListItemType.StreamItem) {
                var notDroppable = false;
                var warnDroppable = false;
                var placeholderText = '';

                var overPlaylist = this.view.childViewOptions.type === ListItemType.PlaylistItem;

                if (overPlaylist) {
                    //  Decorate the placeholder to indicate songs can't be copied.
                    var draggedSongs = ui.sender.data('draggedSongs');

                    //  Show a visual indicator if all dragged stream items are duplicates.
                    var duplicates = _.filter(draggedSongs, function (draggedSong) {
                        return this.view.collection.hasSong(draggedSong);
                    }, this);

                    notDroppable = duplicates.length === draggedSongs.length;
                    warnDroppable = !notDroppable && duplicates.length > 0;
                    //  TODO: Support other collectionNames once I deny duplicates in the stream.
                    var collectionName = chrome.i18n.getMessage('playlist').toLowerCase();
                    
                    if (notDroppable) {
                        if (draggedSongs.length === 1) {
                            placeholderText = chrome.i18n.getMessage('songAlreadyInCollection', [collectionName]);
                        } else {
                            placeholderText = chrome.i18n.getMessage('allSongsAlreadyInCollection', [collectionName]);
                        }
                    }
                    else if (warnDroppable) {
                        placeholderText = chrome.i18n.getMessage('songsAlreadyInCollection', [duplicates.length, draggedSongs.length, collectionName]);
                    }
                }

                var placeholderTextElement = $('<div>', {
                    'class': 'u-marginAuto fontSize-large',
                    text: placeholderText
                });

                ui.placeholder
                    .toggleClass('is-notDroppable', notDroppable)
                    .toggleClass('is-warnDroppable', warnDroppable)
                    .html(placeholderTextElement);
            }
        },
        
        //  Override jQuery UI's sortableItem to allow a dragged item to scroll another sortable collection.
        //  Need to re-call method on start to ensure that dragging still works inside normal parent collection, too.
        // http://stackoverflow.com/questions/11025470/jquery-ui-sortable-scrolling-jsfiddle-example
        _overrideSortableItem: function (ui) {
            var placeholderParent = ui.placeholder.parent().parent();
            var sortableItem = ui.item.data('sortableItem');
            
            sortableItem.scrollParent = placeholderParent;
            sortableItem.overflowOffset = placeholderParent.offset();
        }
    });

    return Sortable;
});