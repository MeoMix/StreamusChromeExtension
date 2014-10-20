define([
    'common/enum/listItemType'
], function (ListItemType) {
    'use strict';

    var Sortable = Backbone.Marionette.Behavior.extend({
        placeholderClass: 'sortable-placeholder',
        copyHelperClass: 'sortable-copyHelper',
        isDraggingClass: 'is-dragging',
        needFixCssRedraw: true,

        onRender: function () {
            this.view.ui.childContainer.sortable(this._getSortableOptions());
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
                placeholder: this.placeholderClass + ' listItem listItem--medium hidden',
                helper: this._helper.bind(this),
                change: this._change.bind(this),
                start: this._start.bind(this),
                stop: this._stop.bind(this),
                tolerance: 'pointer',
                receive: this._receive.bind(this),
                over: this._over.bind(this)
            };

            return sortableOptions;
        },
        
        _helper: function (ui, listItem) {
            var container = this.view.ui.childContainer[0];

            //  Manually clone the dragged item to simulate copying the item between containers.
            //  Create a new view instead of just copying the HTML in order to preserve HTML->Backbone.View relationship
            var copyHelperView = new this.view.childView({
                model: this.view.collection.get(listItem.data('id'))
            });

            var copyHelper = copyHelperView.render().$el;
            copyHelper.addClass(this.copyHelperClass);
            copyHelper.insertAfter(listItem);
            copyHelperView.triggerMethod('show');

            container.copyHelperView = copyHelperView;

            container.backCopyHelper = listItem.prev();
            container.backCopyHelper.addClass(this.copyHelperClass);
            container.copied = false;

            return $('<span>', {
                'class': 'sortable-selectedItemsCount'
            });
        },
        
        _change: function () {
            //  There's a CSS redraw issue with my CSS selector: .listItem.copyHelper + .sortable-placeholder 
            //  So, I manually hide the placeholder (like it would be normally) until a change occurs -- then the CSS can take over.
            if (this.needFixCssRedraw) {
                $('.' + this.placeholderClass).removeClass('hidden');
                this.needFixCssRedraw = false;
            }
        },
        
        _start: function (event, ui) {
            //  TODO: This won't be necessary if I change my logic to 'onMouseDown' instead of 'onClick'.
            this.view.triggerMethod('ItemDragged', this.view.collection.get(ui.item.data('id')));
            this.needFixCssRedraw = true;

            //  Set helper text here, not in helper, because dragStart may select a search result.
            var selected = this.view.collection.selected();
            ui.helper.text(selected.length);
            
            this.view.ui.childContainer.addClass(this.isDraggingClass);
            this.view.ui.childContainer[0].draggedSongs = _.map(selected, function (model) {
                return model.get('song');
            });

            this._overrideSortableItem(ui);
        },
        
        _stop: function (event, ui) {
            //  The SearchResult view is not able to be moved so disable move logic for it.
            var isMovable = ui.item.data('type') !== ListItemType.SearchResult;
            var container = this.view.ui.childContainer[0];

            container.backCopyHelper.removeClass(this.copyHelperClass);
            container.copyHelperView.$el.removeClass(this.copyHelperClass);
            
            if (!container.copied) {
                container.copyHelperView.destroy();

                //  TODO: This doesn't support moving multiple items up/down the list.
                if (isMovable) {
                    var movedDown = ui.position.top > ui.originalPosition.top;
                    //  TODO: Maybe I want to store draggedModels instead of draggedSongs afterall.
                    this._moveItems(this.view.collection.selected(), ui.item.index(), movedDown);
                }
            }
            
            this.view.ui.childContainer.removeClass(this.isDraggingClass);

            delete container.backCopyHelper;
            delete container.copyHelperView;
            delete container.draggedSongs;

            return this.copied || isMovable;
        },
        
        _receive: function (event, ui) {
            var senderElement = ui.sender[0];

            //  Index inside of receive may be incorrect if the user is scrolled down -- some items will have been unrendered.
            //  Need to pad the index with the # of missing items.
            this.view.once('GetMinRenderIndexReponse', function (response) {
                var index = ui.item.index() + response.minRenderIndex;

                this.view.collection.addSongs(senderElement.draggedSongs, {
                    index: index
                });

                //  Swap copy helper out with the actual item once successfully dropped because Marionette keeps track of specific view instances.
                //  Don't swap it out until done using its dropped-position index.
                var copyHelperView = senderElement.copyHelperView;
                copyHelperView.$el.replaceWith(ui.item);
                copyHelperView.destroy();

                Streamus.channels.global.vent.trigger('collectionReceived');
            }.bind(this));

            this.view.triggerMethod('GetMinRenderIndex');

            senderElement.copied = true;
        },
        
        _over: function (event, ui) {
            this._overrideSortableItem(ui);
            this._decoratePlaceholder(ui);
        },
        
        _moveItems: function (items, index, movedDown) {
            //  Index inside of receive may be incorrect if the user is scrolled down -- some items will have been unrendered.
            //  Need to pad the index with the # of missing items.
            this.view.once('GetMinRenderIndexReponse', function (response) {
                //  TODO: This has a bug in it. If you drag an item far enough to exceed the render threshold then it doesn't properly find the index. :(
                //  TODO: Since I now support moving multiple items up/down the 'movedDown' logic is WAY HARDER because it depends on how many items are being moved.
                index += response.minRenderIndex;

                //  When dragging an item down the list -- since the whole list shifts up one -- need to +1 the index after dropping to account.
                if (movedDown) {
                    index += 1;
                }

                _.each(items, function (item) {
                    this.view.collection.moveToIndex(item.get('id'), index);
                    index += 1;
                }, this);
            }.bind(this));

            this.view.triggerMethod('GetMinRenderIndex');
        },
        
        _decoratePlaceholder: function (ui) {
            var senderElement = ui.sender[0];

            var listItemType = ui.item.data('type');

            //  TODO: Also prevent dragging duplicates from Playlist/Search into Stream.
            if (listItemType === ListItemType.StreamItem) {
                var notDroppable = false;
                var warnDroppable = false;
                var placeholderText = '';

                var overPlaylist = this.view.childViewOptions.type === ListItemType.PlaylistItem;

                if (overPlaylist) {
                    //  Decorate the placeholder to indicate songs can't be copied.
                    var draggedSongs = senderElement.draggedSongs;

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