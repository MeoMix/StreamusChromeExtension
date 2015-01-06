define([
    'foreground/model/checkbox',
    'foreground/view/element/checkboxView'
], function (Checkbox, CheckboxView) {
    'use strict';

    var ItemViewMultiSelect = Marionette.Behavior.extend({
        ui: {
            leftContent: '.listItem-leftContent'
        },
        
        events: {
            'mouseenter @ui.leftContent': '_onMouseEnterLeftContent',
            'mouseleave @ui.leftContent': '_onMouseLeaveLeftContent'
        },

        modelEvents: {
            'change:selected': '_onChangeSelected'
        },
        
        isMouseOver: false,
        checkbox: null,
        
        onRender: function () {
            //  TODO: BUG https://github.com/marionettejs/backbone.marionette/issues/1579
            this.checkbox = new Checkbox({
                checked: this.view.model.get('selected')
            });

            this.$el.addClass('js-listItem--multiSelect');
            this._setSelectedClass(this.view.model.get('selected'));
        },
        
        _onMouseEnterLeftContent: function () {
            this.isMouseOver = true;
            
            if (!this.view.model.get('selected')) {
                this.ui.leftContent.addClass('is-showingCheckbox');
                this.ui.leftContent.removeClass('is-showingThumbnail');
                
                this.view.checkboxRegion.show(new CheckboxView({
                    model: this.checkbox
                }));
            }
        },
        
        _onMouseLeaveLeftContent: function () {
            this.isMouseOver = false;
            
            if (!this.view.model.get('selected')) {
                this.ui.leftContent.removeClass('is-showingCheckbox');
                this.ui.leftContent.addClass('is-showingThumbnail');

                this.view.checkboxRegion.empty();
            }
        },
        
        _onChangeSelected: function (model, selected) {
            this._setSelectedClass(selected);
            this.checkbox.set('checked', selected);
        },

        _setSelectedClass: function (selected) {
            this.$el.toggleClass('is-selected', selected);
            
            if (!this.isMouseOver) {
                this.ui.leftContent.toggleClass('is-showingCheckbox', selected);
                this.ui.leftContent.toggleClass('is-showingThumbnail', !selected);
                
                if (selected) {
                    this.view.checkboxRegion.show(new CheckboxView({
                        model: this.checkbox
                    }));
                }
            }
        }
    });

    return ItemViewMultiSelect;
});