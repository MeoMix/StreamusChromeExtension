define(function () {
    'use strict';

    var MultiSelect = Backbone.Marionette.Behavior.extend({
        ui: {
            listItem: '.list-item'
        },

        events: {
            'click @ui.listItem': 'setSelectedOnClick',
        },
        
        onItemDragged: function(item) {
            this._setSelected({
                modelToSelect: item,
                drag: true
            });
        },
        
        setSelectedOnClick: function (event) {
            var id = $(event.currentTarget).data('id');
            var modelToSelect = this.view.collection.get(id);

            this._setSelected({
                shiftKey: event.shiftKey,
                ctrlKey: event.ctrlKey,
                modelToSelect: modelToSelect
            });
        },
        
        _setSelected: function (options) {
            var modelToSelect = options.modelToSelect;

            var shiftKeyPressed = options.shiftKey || false;
            var ctrlKeyPressed = options.ctrlKey || false;
            var isDrag = options.drag || false;

            var isSelectedAlready = modelToSelect.get('selected');
            modelToSelect.set('selected', (ctrlKeyPressed && isSelectedAlready) ? false : true);

            //  When the shift key is pressed - select a block of search result items
            if (shiftKeyPressed) {
                var selectedIndex = this.view.collection.indexOf(modelToSelect);
                this._selectGroup(selectedIndex);
            } else if (ctrlKeyPressed) {
                //  Using the ctrl key to select an item resets firstSelect (which is a special scenario)
                //  but doesn't lose the other selected items.
                modelToSelect.set('firstSelected', true);
            } else if (!(isDrag && isSelectedAlready)) {
                //  All other selections are lost unless dragging a group of items.
                this.view.collection.deselectAllExcept(modelToSelect);
            }
        },
        
        _selectGroup: function (selectedIndex) {
            var firstSelectedIndex = 0;
            var collection = this.view.collection;

            //  If the first item is being selected with shift held -- firstSelectedIndex isn't used and selection goes from the top.
            if (collection.selected().length > 1) {
                var firstSelected = collection.firstSelected();

                //  Get the search result which was selected first and go from its index.
                firstSelectedIndex = collection.indexOf(firstSelected);
            }

            //  Select all items between the selected item and the firstSelected item.
            collection.each(function (model, index) {
                var isBetweenAbove = index <= selectedIndex && index >= firstSelectedIndex;
                var isBetweenBelow = index >= selectedIndex && index <= firstSelectedIndex;

                model.set('selected', isBetweenBelow || isBetweenAbove);
            });

            //  Holding the shift key is a bit of a special case. User expects the first item highlighted to be the 'firstSelected' and not the clicked.
            collection.at(firstSelectedIndex).set('firstSelected', true);
        }
    });

    return MultiSelect;
});