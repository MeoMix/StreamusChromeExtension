define(function(require) {
    'use strict';

    var ListItemType = require('common/enum/listItemType');

    var Sortable = Marionette.Behavior.extend({
        placeholderClass: 'sortable-placeholder',
        isDraggingClass: 'is-dragging',
        childViewHeight: 56,
        isDecorated: false,

        events: {
            'mouseenter': '_onMouseEnter'
        },

        _onMouseEnter: function () {
            //  There's no reason to take this perf hit unless the user is actually going to use sortable logic.
            //  So, only run it once the user could potentially need to do so.
            if (!this.isDecorated) {
                this.isDecorated = true;

                this.ui.childContainer.sortable(this._getSortableOptions());

                this.$el.scroll(_.throttle(function() {
                    //  Any function which is throttled can potentially be ran after the view is destroyed.
                    if (!this.view.isDestroyed) {
                        this.ui.childContainer.sortable('refresh');
                    }
                }.bind(this), 20));
            }
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
                placeholder: this.placeholderClass + ' listItem listItem--medium is-hidden',
                helper: this._helper.bind(this),
                change: this._change.bind(this),
                start: this._start.bind(this),
                stop: this._stop.bind(this),
                tolerance: 'pointer',
                receive: this._receive.bind(this),
                over: this._over.bind(this),
                out: this._out.bind(this),
                beforeStop: this._beforeStop.bind(this)
            };

            return sortableOptions;
        },

        _helper: function() {
            return $('<span>', {
                'class': 'sortable-selectedItemsCount'
            });
        },

        _change: function(event, ui) {
            var placeholderAdjacent = false;
            //  When dragging an element up/down its own list -- hide the sortable helper around the element being dragged.
            var draggedItems = this.view.collection.selected();
            //  Only disallow moving to adjacent location if dragging one item because that'd be a no-op.
            if (draggedItems.length === 1) {
                var draggedModelId = draggedItems[0].get('id');
                placeholderAdjacent = ui.placeholder.next().data('id') === draggedModelId || ui.placeholder.prev().data('id') === draggedModelId;
            }

            $('.' + this.placeholderClass).toggleClass('is-hidden', placeholderAdjacent);

            this.ui.childContainer.sortable('refresh');

            //  Hiding or removing the placeholder modifies the height of the child container which can cause a scrollbar to appear/disappear. So, need to notify.
            this.view.triggerMethod('UpdateScrollbar');
        },

        _start: function(event, ui) {
            Streamus.channels.element.vent.trigger('drag');
            this.view.triggerMethod('ItemDragged', {
                item: this.view.collection.get(ui.item.data('id')),
                shiftKey: event.shiftKey
            });

            //  Set helper text here, not in helper, because dragStart may select a search result.
            var selectedItems = this.view.collection.selected();
            ui.helper.text(selectedItems.length);

            var draggedSongs = _.map(selectedItems, function(item) {
                return item.get('song');
            });

            this.ui.childContainer.addClass(this.isDraggingClass).data({
                draggedSongs: draggedSongs
            });

            this._overrideSortableItem(ui);
        },
        
        //  Placeholder stops being accessible once beforeStop finishes, so store its index here for use later.
        _beforeStop: function(event, ui) {
            //  Subtract one from placeholderIndex when parentNode exists because jQuery UI moves the HTML element above the placeholder.
            this.ui.childContainer.data({
                placeholderIndex: ui.placeholder.index() - 1
            });
        },

        _stop: function(event, ui) {
            var isParentNodeLost = ui.item[0].parentNode === null;

            //  TODO: Check collection isImmutable instead of ListItemType.
            //  The SearchResult view is not able to be moved so disable move logic for it.
            //  If the mouse dropped the items not over the given list don't run move logic.
            var allowMove = ui.item.data('type') !== ListItemType.SearchResult && this.ui.childContainer.is(':hover');
            if (allowMove) {
                this.view.once('GetMinRenderIndexResponse', function(response) {
                    var dropIndex = this.ui.childContainer.data('placeholderIndex') + response.minRenderIndex;
                    this._moveItems(this.view.collection.selected(), dropIndex, isParentNodeLost);
                    this._cleanup();
                }.bind(this));
                this.view.triggerMethod('GetMinRenderIndex');
            } else {
                //  _.defer allows for jQuery UI to finish interacting with the element. Without this, CSS animations do not run.
                _.defer(this._cleanup.bind(this));
            }

            //  Return false from stop to prevent jQuery UI from moving HTML for us - only need to prevent during copies and not during moves.
            var removeHtmlElement = allowMove || isParentNodeLost;
            return removeHtmlElement;
        },

        _cleanup: function() {
            this.ui.childContainer.removeData('draggedSongs placeholderIndex').removeClass(this.isDraggingClass);
            Streamus.channels.element.vent.trigger('drop');
        },

        _receive: function(event, ui) {
            //  If the parentNode does not exist then slidingRender has removed the HTML element which means the HTML element is not above the placeholder and I need to +1.
            //  This only applies for receiving and not for sorting elements within the parent list, so don't do this logic in onBeforeStop because it's not clear
            //  if sort or receive is happening.
            var placeholderIndex = ui.sender.data('placeholderIndex');

            if (ui.item[0].parentNode === null) {
                placeholderIndex += 1;
            }

            this.view.once('GetMinRenderIndexResponse', function(response) {
                this.view.collection.addSongs(ui.sender.data('draggedSongs'), {
                    index: placeholderIndex + response.minRenderIndex
                });

                //  TODO: Since I provided the index that the item would be inserted at in the collection, the collection does not resort.
                //  But, the index in the collection does not correspond to the index in the CollectionView -- that's simply the placeholderIndex. Not sure how to handle that.
                //  I'd need to intercept the _onCollectionAdd event of Marionette, calculate the proper index, and pass bypass: true in, but not going to do that for now.
                this.view.collection.sort();
            }.bind(this));
            this.view.triggerMethod('GetMinRenderIndex');
        },

        _over: function(event, ui) {
            this._overrideSortableItem(ui);
            this._decoratePlaceholder(ui);

            //  Hiding or removing the placeholder modifies the height of the child container which can cause a scrollbar to appear/disappear. So, need to notify.
            this.view.triggerMethod('UpdateScrollbar');
        },

        _out: function() {
            //  Hiding or removing the placeholder modifies the height of the child container which can cause a scrollbar to appear/disappear. So, need to notify.
            this.view.triggerMethod('UpdateScrollbar');
        },

        _moveItems: function(items, dropIndex, isParentNodeLost) {
            var moved = false;
            var itemsHandledBelowOrAtDropIndex = 0;
            var itemsHandled = 0;

            //  Capture the indices of the items being moved before actually moving them because sorts on the collection will
            //  change indices during each iteration.
            var dropInfoList = _.map(items, function(item) {
                return {
                    itemId: item.get('id'),
                    itemIndex: this.view.collection.indexOf(item)
                };
            }, this);

            _.each(dropInfoList, function(dropInfo) {
                var index = dropIndex;
                var aboveDropIndex = dropInfo.itemIndex > dropIndex;

                if (aboveDropIndex && isParentNodeLost) {
                    index += 1;
                }

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
            
            if (moved) {
                //  If a move happened call sort without silent so that views can update accordingly.
                this.view.collection.sort();
                //  TODO: Trigger an event which causes the scrollbar to update instead.
                //  Need to update the scrollbar because if the drag-and-drop placeholder pushed scrollTop beyond its normal limits
                //  then the scrollbar is not representing the correct height after the placeholder is removed.
                this.view._behaviors[1]._updateScrollbar();
            }
        },

        _decoratePlaceholder: function(ui) {
            var notDroppable = false;
            var warnDroppable = false;
            var placeholderText = '';

            var overOtherCollection = this.view.childViewType !== ui.item.data('type');
            if (overOtherCollection) {
                //  Decorate the placeholder to indicate songs can't be copied.
                var draggedSongs = ui.sender.data('draggedSongs');
                //  Show a visual indicator if all dragged stream items are duplicates.
                var duplicatesInfo = this.view.collection.getDuplicatesInfo(draggedSongs);
                notDroppable = duplicatesInfo.allDuplicates;
                warnDroppable = duplicatesInfo.someDuplicates;
                placeholderText = duplicatesInfo.message;
            }

            var placeholderTextElement = $('<span>', {
                'class': 'u-marginAuto',
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
        _overrideSortableItem: function(ui) {
            var placeholderParent = ui.placeholder.parent().parent();
            var sortableItem = ui.item.data('sortableItem');

            //  If the item being sorted has been unloaded by slidingRender behavior then sortableItem will be unavailable.
            //  In this scenario, fall back to the more expensive query of getting a reference to the sortable instance via its parent's ID.
            if (_.isUndefined(sortableItem)) {
                sortableItem = $('#' + ui.item.data('parentid')).sortable('instance');
            }

            sortableItem.scrollParent = placeholderParent;
            sortableItem.overflowOffset = placeholderParent.offset();
        }
    });

    return Sortable;
});