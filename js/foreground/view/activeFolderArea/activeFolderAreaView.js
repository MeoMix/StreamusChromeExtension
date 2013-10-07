define([
    'activeFolderView',
    'text!../template/activeFolderArea.htm'
], function (ActiveFolderView, ActiveFolderAreaTemplate) {
    'use strict';

    var ActiveFolderAreaView = Backbone.View.extend({

        template: _.template(ActiveFolderAreaTemplate),

        activeFolderView: null,

        attributes: {
            'id': 'activeFolderArea'
        },
        
        render: function () {
            
            this.$el.html(this.template(
                _.extend(this.model.toJSON(), {
                    //  Mix in chrome to reference internationalize.
                    'chrome.i18n': chrome.i18n
                })
            ));

            this.$el.find('.list').append(this.activeFolderView.render().el);

            return this;
        },
        
        events: {
            'click h3': 'toggleActiveFolderVisibility',
            'click .panel': 'consumePanelClick'
        },
        
        //  Don't bubble panel clicks up to the overlay so can tell when overlay outside panel has been clicked.
        consumePanelClick: function (event) {
            event.stopPropagation();
            return false;
        },
        
        //playlistInputView: null,
        
        initialize: function() {

            //  TODO: Do I have to set this in initialize or can I do it through the property?
            this.activeFolderView = new ActiveFolderView({
                model: this.model
            });
            
            //this.playlistInputView = new PlaylistInputView({
            //    model: this.model
            //});

            //this.$el.prepend(this.playlistInputView.render().el);
        },
        
        show: function() {
            this.$el.fadeIn(200, function () {
                $(this).addClass("visible");
            });
        },
        
        hide: function(callback) {
            var self = this;
            
            this.$el.removeClass('visible').fadeOut(function () {
                self.remove();
                callback();
            });

        },

        toggleActiveFolderVisibility: function(event) {

            var caretIcon = $(event.currentTarget).find('i');

            var isExpanded = caretIcon.hasClass('icon-caret-down');

            if (isExpanded) {
                caretIcon.removeClass('icon-caret-down').addClass('icon-caret-right');
                this.activeFolderView.$el.slideUp(200);
            } else {
                caretIcon.addClass('icon-caret-down').removeClass('icon-caret-right');
                this.activeFolderView.$el.slideDown(200);
            }

        }

    });

    return ActiveFolderAreaView;
});