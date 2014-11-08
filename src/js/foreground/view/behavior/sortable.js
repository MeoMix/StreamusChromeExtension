define([
    'common/enum/direction',
    'common/enum/listItemType'
], function (Direction, ListItemType) {
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
                    right: 32,
                    bottom: 30
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
            Streamus.channels.element.vent.trigger('drag');
            this.view.triggerMethod('ItemDragged', {
                item: this.view.collection.get(ui.item.data('id')),
                ctrlKey: event.ctrlKey,
                shiftKey: event.shiftKey
            });
            
            //  Set helper text here, not in helper, because dragStart may select a search result.
            var selectedItems = this.view.collection.selected();
            ui.helper.text(selectedItems.length);

            var draggedSongs = _.map(selectedItems, function (item) {
                return item.get('song');
            });

            this.view.ui.childContainer.addClass(this.isDraggingClass).data({
                draggedSongs: draggedSongs
            });

            this._overrideSortableItem(ui);
        },
        
        //  Placeholder stops being accessible once beforeStop finishes, so store its index here for use later.
        _beforeStop: function (event, ui) {
            //  Subtract one from placeholderIndex because it is the next sibling of the target position.
            this.view.ui.childContainer.data({
                placeholderIndex: ui.placeholder.index() - 1
            });
        },
        
        _stop: function (event, ui) {
            var childContainer = this.view.ui.childContainer;

            //  The SearchResult view is not able to be moved so disable move logic for it.
            //  If the mouse dropped the items not over the given list don't run move logic.
            var allowMove = ui.item.data('type') !== ListItemType.SearchResult && childContainer.is(':hover');
            if (allowMove) {
                this.view.once('GetMinRenderIndexReponse', function(response) {
                    var dropIndex = childContainer.data('placeholderIndex') + response.minRenderIndex;
                    this._moveItems(this.view.collection.selected(), dropIndex);
                    
                    this._cleanup();
                }.bind(this));
                this.view.triggerMethod('GetMinRenderIndex');
            } else {
                //  setTimeout allows for jQuery UI to finish interacting with the element. Without this, CSS animations do not run.
                setTimeout(this._cleanup.bind(this));
            }

            //  Return false from stop to prevent jQuery UI from moving HTML for us - only need to prevent during copies and not during moves.
            return allowMove;
        },
        
        _cleanup: function () {
            this.view.ui.childContainer.removeData('draggedSongs placeholderIndex').removeClass(this.isDraggingClass);
        },
        
        _receive: function (event, ui) {
            this.view.once('GetMinRenderIndexReponse', function (response) {
                this.view.collection.addSongs(ui.sender.data('draggedSongs'), {
                    index: ui.sender.data('placeholderIndex') + response.minRenderIndex
                });

                //  Only announced 'drop' in 'receive' and not when moving item up/down its own collection because it feels weird to de-select when in same parent.
                //  Delay announcing drop until after _stop has finished to let jQuery UI finish executing.
                setTimeout(function () {
                    Streamus.channels.element.vent.trigger('drop');
                });
            }.bind(this));
            this.view.triggerMethod('GetMinRenderIndex');
        },
        
        _over: function (event, ui) {
            this._overrideSortableItem(ui);
            this._decoratePlaceholder(ui);
        },

        _moveItems: function (items, dropIndex) {
            var moved = false;
            var itemsHandledBelowOrAtDropIndex = 0;
            var itemsHandled = 0;

            //  Capture the indices of the items being moved before actually moving them because sorts on the collection will
            //  change indices during each iteration.
            var dropInfoList = _.map(items, function (item) {
                return {
                    itemId: item.get('id'),
                    itemIndex: this.view.collection.indexOf(item)
                };
            }, this);

            _.each(dropInfoList, function (dropInfo) {
                var index = dropIndex;
                var aboveDropIndex = dropInfo.itemIndex > dropIndex;

                //  Moving items below the drop index causes indices to shift with each move, but this is not the case with above the index.
                if (aboveDropIndex) {
                    //  So, the target index should be incremented to put the item an appropriate number of slots past dropIndex.
                    index += itemsHandled;
                    //  However, each item moved below the index doesn't count - except for the one placed AT the drop index, thus subtract one.
                    if (itemsHandledBelowOrAtDropIndex > 0) {
                        index -= (itemsHandledBelowOrAtDropIndex - 1);
                    }
                }
                
                //  Pass silent: true to moveToIndex because we might be looping over many items in which case I don't want to refresh the view repeatedly.
                var moveResult = this.view.collection.moveToIndex(dropInfo.itemId, index, {
                    silent: true
                });

                //  When an item is moved down all the indices slide up one, so no need to increment.
                if (moveResult.moved) {
                    moved = true;
                }
                
                if (!aboveDropIndex) {
                    itemsHandledBelowOrAtDropIndex += 1;
                }

                itemsHandled++;
            }, this);
            
            //  If a move happened call sort without silent so that views can update accordingly.
            if (moved) {
                this.view.collection.sort();
            }
        },
        
        _decoratePlaceholder: function (ui) {
            var notDroppable = false;
            var warnDroppable = false;
            var placeholderText = '';
            
            var overOtherCollection = this.view.childViewOptions.type !== ui.item.data('type');
            if (overOtherCollection) {
                //  Decorate the placeholder to indicate songs can't be copied.
                var draggedSongs = ui.sender.data('draggedSongs');
                //  Show a visual indicator if all dragged stream items are duplicates.
                var duplicatesInfo = this.view.collection.getDuplicatesInfo(draggedSongs);
                notDroppable = duplicatesInfo.allDuplicates;
                warnDroppable = duplicatesInfo.someDuplicates;
                placeholderText = duplicatesInfo.message;
            }

            var placeholderTextElement = $('<div>', {
                'class': 'u-marginAuto fontSize-large',
                text: placeholderText
            });

            ui.placeholder
                .toggleClass('is-notDroppable', notDroppable)
                .toggleClass('is-warnDroppable', warnDroppable)
                .html(placeholderTextElement);
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