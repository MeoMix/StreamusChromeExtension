define([
    'foreground/view/genericForegroundView',
    'text!template/searchButton.html'
], function (GenericForegroundView, SearchButtonTemplate) {
    'use strict';

    var SearchButtonView = GenericForegroundView.extend({

        tagName: 'button',

        className: 'button-label searchPlaylist',
                                
        template: _.template(SearchButtonTemplate),

        attributes: {
            title: chrome.i18n.getMessage('search')
        },
        
        events: {
            'click': 'searchPlaylist'
        },

        render: function () {
            this.$el.html(this.template());
            //  TODO: disabled until I figure out how to display it nicely. Do I want to lose txt on all buttons?
            this.$el.hide();
            return this;
        },
        
        searchPlaylist: function () {
            console.log("Search playlist...");
        }
        
    });
    
    return SearchButtonView;
});