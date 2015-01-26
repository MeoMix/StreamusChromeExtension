define(function (require) {
    'use strict';

    var Checkbox = require('foreground/model/checkbox');
    var CheckboxView = require('foreground/view/element/checkboxView');

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
        
        initialize: function () {
            this.checkbox = new Checkbox({
                //  TODO: I cannot access this.view.model in initialize from a behavior. https://github.com/marionettejs/backbone.marionette/issues/1579
                checked: this.view.options.model.get('selected')
            });
        },
        
        onRender: function () {
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