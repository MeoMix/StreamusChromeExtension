define(function () {
    'use strict';

    var ContentHeaderView = Backbone.View.extend({
       
        className: 'header',
        
        template: _.template($('#contentHeaderTemplate').html()),
        
        buttonText: '',
        inputPlaceholderText: '',
        
        events: {
          
            'input .headerInput': 'updateTitle',
            'mouseout .headerInput': 'blurIfEmpty',
            'click .addButton': 'expand',
            'click .addCancelIcon': 'contract'
        },

        render: function () {
           
            this.$el.html(this.template(this.model.toJSON()));

            this.$el.find('.addText').text(this.buttonText);
            this.$el.find('.addInput').attr('placeholder', this.inputPlaceholderText);
            
            return this;
        },

        initialize: function (options) {
            
            this.buttonText = options.buttonText;
            this.inputPlaceholderText = options.inputPlaceholderText;

            //  TODO: I think I might need to re-call this every re-render and keep track of expanded state? Unsure.
            if (options.expanded) {
                this.expand();
            }

        },
        
        changeModel: function(newModel) {
            this.model = newModel;
            this.render();
        },
        
        expand: function() {
            this.$el.addClass('expanded');
            this.$el.find('.headerInput').prop('disabled', true);
            this.$el.find('.addInput').focus();
        },
        
        contract: function() {
            this.$el.removeClass('expanded');
            this.$el.find('.headerInput').prop('disabled', false);
            this.$el.find('.addInput').val('').blur();

            //  Prevent click event from bubbling up so button does not expand on click.
            return false;
        },
        
        updateTitle: function (event) {
            this.model.set('title', $(event.currentTarget).val());
        },
        
        blurIfEmpty: function (event) {

            //  Don't blur if they're trying to highlight some text to edit and go outside the bounds.
            if (window.getSelection().toString() === '') {
                $(event.currentTarget).blur();
            }
        },
        
        getUserInput: function() {
            return $.trim(this.$el.find('.addInput').val());
        },
        
        clearUserInput: function() {
            this.$el.find('.addInput').val('');
        },
        
        enableAutocompleteOnUserInput: function (options) {

            //  http://stackoverflow.com/questions/3488016/using-html-in-jquery-ui-autocomplete
            this.$el.find('.addInput').autocomplete(options).data("ui-autocomplete")._renderItem = function (ul, item) {
                return $("<li></li>")
                    .data("item.autocomplete", item)
                    .append("<a>" + item.label + "</a>")
                    .appendTo(ul);
            };
        },
        
        setAutocompleteSource: function(source) {
            this.$el.find('.addInput').autocomplete({ source: source });
        },
        
        triggerAutocompleteSearch: function() {
            this.$el.find('.addInput').autocomplete('search', '');
        }

    });

    return ContentHeaderView;
});