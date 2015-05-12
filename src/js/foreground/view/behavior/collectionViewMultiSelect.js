define(function() {
    'use strict';

    var CollectionViewMultiSelect = Marionette.Behavior.extend({
        initialize: function() {
            this.listenTo(Streamus.channels.element.vent, 'click', this._onElementClick);
            this.listenTo(Streamus.channels.element.vent, 'drop', this._onElementDrop);
            this.listenTo(Streamus.channels.listItem.vent, 'selected', this._onListItemSelected);
            this.listenTo(Streamus.channels.listItem.commands, 'deselect:collection', this._deselectCollection);
        },
        
        //  Whenever an item is dragged - ensure it is selected because click event doesn't happen
        //  when performing a drag operation. It doesn't feel right to use mousedown instead of click.
        onItemDragged: function(options) {
            this._setSelected({
                modelToSelect: options.item,
                shiftKey: event.shiftKey,
                drag: true
            });
        },

        onDeselectCollection: function() {
            this._deselectCollection();
        },

        _onListItemSelected: function(options) {
            if (this.view.childViewType !== options.listItemType) {
                this._deselectCollection();
            }
        },

        _onElementDrop: function() {
            this._deselectCollection();
        },

        _deselectCollection: function() {
            this.view.collection.deselectAll();
        },
        
        onChildviewClickLeftContent: function(childView, options) {
            this._setSelected({
                shiftKey: options.shiftKey,
                modelToSelect: options.model
            });

            //  Since returning false, need to announce the event happened here since root level won't know about it.
            Streamus.channels.element.vent.trigger('click', event);
            //  Don't allow to bubble up since handling click at this level.
            return false;
        },

        _setSelected: function(options) {
            var modelToSelect = options.modelToSelect;

            var shiftKeyPressed = options.shiftKey || false;
            var isDrag = options.drag || false;

            var isSelectedAlready = modelToSelect.get('selected');

            //  It's important to check shiftKeyPressed because selectGroup relies on firstSelected which will be undefined if modelToSelect is deselected
            //  when it was also the firstSelected. i.e. hold shift, group select 0-3, then hold shift, select 0. 0 is set to selected: false, 1-2 are still selected, no firstSelected.
            modelToSelect.set('selected', isSelectedAlready && !shiftKeyPressed && !isDrag ? false : true);

            if (shiftKeyPressed) {
                //  When the shift key is pressed - select a block of search result items
                var selectedIndex = this.view.collection.indexOf(modelToSelect);
                this._selectGroup(selectedIndex);
            }

            Streamus.channels.listItem.vent.trigger('selected', {
                listItemType: modelToSelect.get('listItemType')
            });
        },

        _selectGroup: function(selectedIndex) {
            var firstSelectedIndex = 0;
            var collection = this.view.collection;

            //  If the first item is being selected with shift held -- firstSelectedIndex isn't used and selection goes from the top.
            if (collection.selected().length > 1) {
                var firstSelected = collection.firstSelected();

                //  Get the search result which was selected first and go from its index.
                firstSelectedIndex = collection.indexOf(firstSelected);
            }

            //  Select all items between the selected item and the firstSelected item.
            collection.each(function(model, index) {
                var isBetweenAbove = index <= selectedIndex && index >= firstSelectedIndex;
                var isBetweenBelow = index >= selectedIndex && index <= firstSelectedIndex;

                model.set('selected', isBetweenBelow || isBetweenAbove);
            });

            //  Holding the shift key is a bit of a special case. User expects the first item highlighted to be the 'firstSelected' and not the clicked.
            collection.at(firstSelectedIndex).set('firstSelected', true);
        }
    });

    return CollectionViewMultiSelect;
});