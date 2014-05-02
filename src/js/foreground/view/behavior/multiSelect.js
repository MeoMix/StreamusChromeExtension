define(function () {
    'use strict';

    var MultiSelect = Backbone.Marionette.Behavior.extend({
        events: {
            'click @ui.listItem': 'setSelectedOnClick',
        },
        
        onItemDragged: function(item) {
            this.doSetSelected({
                modelToSelect: item,
                drag: true
            });
        },
        
        //  TODO: Find a way to pass in collection instead of referencing through view.
        setSelectedOnClick: function (event) {
            console.log("Set selected on click running");

            var id = $(event.currentTarget).data('id');
            var modelToSelect = this.view.collection.get(id);

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
                var selectedIndex = this.view.collection.indexOf(modelToSelect);

                //  If the first item is being selected with shift held -- firstSelectedIndex isn't used and selection goes from the top.
                if (this.view.collection.selected().length > 1) {
                    var firstSelected = this.view.collection.firstSelected();

                    //  Get the search result which was selected first and go from its index.
                    firstSelectedIndex = this.view.collection.indexOf(firstSelected);
                }

                //  Select all items between the selected item and the firstSelected item.
                this.view.collection.each(function (model, index) {
                    var isBetweenAbove = index <= selectedIndex && index >= firstSelectedIndex;
                    var isBetweenBelow = index >= selectedIndex && index <= firstSelectedIndex;

                    model.set('selected', isBetweenBelow || isBetweenAbove);
                });

                //  Holding the shift key is a bit of a special case. User expects the first item highlighted to be the 'firstSelected' and not the clicked.
                this.view.collection.at(firstSelectedIndex).set('firstSelected', true);

            } else if (ctrlKeyPressed) {
                //  Using the ctrl key to select an item resets firstSelect (which is a special scenario)
                //  but doesn't lose the other selected items.
                modelToSelect.set('firstSelected', true);
            } else if (!(isDrag && isSelectedAlready)) {
                //  All other selections are lost unless dragging a group of items.
                this.view.collection.deselectAllExcept(modelToSelect);
            }
        }
    });

    return MultiSelect;
});