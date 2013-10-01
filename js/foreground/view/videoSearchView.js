define(function() {
    'use strict';

    var VideoSearchView = Backbone.View.extend({
        
        className: 'left-pane',
        
        template: _.template($('#videoSearchTemplate').html()),
        
        attributes: {
            id: 'search'
        },
        
        events: {
            'focus .searchBar input': 'highlight',
            'blur .searchBar input': 'lowlight'
        },

        render: function () {
            //this.model.toJSON()
            this.$el.html(this.template());
            
            return this;
        },
        
        initialize: function () {
            

        },
        
        highlight: function() {
            this.$el.find('.searchBottomOutline').addClass('active');
        },
        
        lowlight: function() {
            this.$el.find('.searchBottomOutline').removeClass('active');
        },
        
        showAndFocus: function() {
            this.$el.fadeIn();
            this.$el.find('.searchBar input').focus();
        },
        
        hide: function() {
            this.$el.fadeOut();
        }

    });


    return VideoSearchView;
});