define([
    'text!../template/addSearchResults.htm',
    'streamItems',
    'videoSearchResults',
    'addSearchResultOption',
    'addSearchResultOptionView',
    'addSearchResultOptionType'
], function (AddSearchResultsTemplate, StreamItems, VideoSearchResults, AddSearchResultOption, AddSearchResultOptionView, AddSearchResultOptionType) {
    'use strict';

    var AddSearchResultsView = Backbone.View.extend({

        template: _.template(AddSearchResultsTemplate),
        
        attributes: {
            'id': 'addItems'
        },
        
        events: {
            'click #hideAddItemsButton': 'destroyModel'
        },
        
        streamItemsLength: null,
        resetStateTimeout: null,

        render: function () {

            this.$el.html(this.template(
                _.extend(this.model.toJSON(), {
                    'selectedResultsLength': VideoSearchResults.selected().length
                })
            ));
            
            var streamAddSearchResultOption = new AddSearchResultOption({
                title: 'Now playing stream',
                entity: StreamItems,
                type: AddSearchResultOptionType.STREAM
            });

            var streamAddSearchResultOptionView = new AddSearchResultOptionView({
                model: streamAddSearchResultOption
            });

            var divider = this.$el.find('.divider');

            divider.before(streamAddSearchResultOptionView.render().el);

            var playlistAddSearchResultOptionElements = this.model.get('folder').get('playlists').map(function(playlist) {

                var playlistAddSearchResultOption = new AddSearchResultOption({
                    title: playlist.get('title'),
                    entity: playlist,
                    type: AddSearchResultOptionType.PLAYLIST
                });

                var playlistAddSearchResultOptionView = new AddSearchResultOptionView({
                    model: playlistAddSearchResultOption
                });

                return playlistAddSearchResultOptionView.render().el;
            });

            divider.after(playlistAddSearchResultOptionElements);

            this.streamItemCount = this.$el.find('.addItemOption.stream span.item-count');
            this.selectedItemsMessage = this.$el.find('span.selectedItemsMessage');

            return this;
        },
        
        initialize: function() {
            this.listenTo(VideoSearchResults, 'change:selected', this.updateSelectedItemsMessage);
            this.listenTo(this.model, 'destroy', this.hide);
        },
        
        updateSelectedItemsMessage: function() {

            var selectedCount = VideoSearchResults.selected().length;
            
            if (selectedCount === 1) {
                this.selectedItemsMessage.text('Add ' + selectedCount + ' item to:');
            } else {
                this.selectedItemsMessage.text('Add ' + selectedCount + ' items to:');
            }

        },
        
        show: function () {
            this.$el.fadeIn(200, function () {
                $(this).addClass("visible");
            });
        },
        
        destroyModel: function () {
            this.model.destroy();
        },

        hide: function () {
            var self = this;

            this.$el.removeClass('visible').fadeOut(function () {
                self.remove();
            });
        }

    });

    return AddSearchResultsView;
});