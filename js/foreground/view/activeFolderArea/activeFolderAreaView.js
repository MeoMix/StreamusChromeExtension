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
            'click': 'hideIfClickOutsidePanel',
            'click .hide': 'destroyModel',
            'click h3': 'toggleActiveFolderVisibility'
        },
        
        //playlistInputView: null,
        
        initialize: function() {

            //  TODO: Do I have to set this in initialize or can I do it through the property?
            this.activeFolderView = new ActiveFolderView({
                model: this.model.get('folder')
            });
            
            //this.playlistInputView = new PlaylistInputView({
            //    model: this.model
            //});

            //this.$el.prepend(this.playlistInputView.render().el);

            this.listenTo(this.model, 'destroy', this.hide);

        },
        
        show: function () {

            this.$el.show().transition({
                opacity: 1
            }, 200, function () {
                $(this).addClass('visible');
            });
            
        },
        
        destroyModel: function () {
            this.model.destroy();
        },
        
        //  If the user clicks the 'dark' area outside the panel -- hide the panel.
        hideIfClickOutsidePanel: function(event) {

            if (event.target == event.currentTarget) {
                this.model.destroy();
            }
        },
        
        hide: function() {
            var self = this;
            
            //  TODO: Should the fadeout time be the same as the fadein time?
            this.$el.removeClass('visible').transition({
                opacity: 0
            }, 400, function () {
                self.remove();
            });
            
        },

        toggleActiveFolderVisibility: function(event) {

            var caretIcon = $(event.currentTarget).find('i');
            //  TODO: Would be nice to read from a model and not inspect the view.
            var isExpanded = caretIcon.hasClass('icon-caret-down');
            
            var activeFolderViewElement = this.activeFolderView.$el;

            if (isExpanded) {
                caretIcon.removeClass('icon-caret-down').addClass('icon-caret-right');

                activeFolderViewElement.data('oldheight', activeFolderViewElement.css('height'));

                activeFolderViewElement.transition({
                    height: 0
                }, 200, function () {
                    $(this).hide();
                });

            } else {
                caretIcon.addClass('icon-caret-down').removeClass('icon-caret-right');

                this.activeFolderView.$el.show().transition({
                    height: activeFolderViewElement.data('oldheight')
                }, 200);
            }

        }

    });

    return ActiveFolderAreaView;
});