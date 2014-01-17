define([
    'text!template/addSearchResults.html',
    'foreground/view/genericForegroundView',
    'foreground/collection/streamItems',
    'foreground/collection/videoSearchResults',
    'foreground/model/addSearchResultOption',
    'foreground/view/videoSearch/addSearchResultOptionView',
    'foreground/view/videoSearch/addSearchResultPlaylistOptionsView',
    'enum/addSearchResultOptionType',
    'common/model/utility'
], function (AddSearchResultsTemplate, GenericForegroundView, StreamItems, VideoSearchResults, AddSearchResultOption, AddSearchResultOptionView, AddSearchResultPlaylistOptionsView, AddSearchResultOptionType, Utility) {
    'use strict';

    var AddSearchResultsView = GenericForegroundView.extend({

        template: _.template(AddSearchResultsTemplate),
        
        attributes: {
            'id': 'addSearchResults'
        },
        
        events: {
            'click #hideAddItemsButton': 'destroyModel'
        },

        addSearchResultPlaylistOptionsView: null,
        streamItemCount: null,
        selectedItemsMessage: null,
        panel: null,

        render: function () {

            this.$el.html(this.template(
                _.extend(this.model.toJSON(), {
                    'selectedResultsLength': VideoSearchResults.selected().length
                })
            ));
            
            var streamAddSearchResultOptionView = new AddSearchResultOptionView({
                model: new AddSearchResultOption({
                    title: 'Now playing stream',
                    entity: StreamItems,
                    type: AddSearchResultOptionType.Stream
                })
            });
            
            this.$el.find('#addSearchResultStreamOptionView').replaceWith(streamAddSearchResultOptionView.render().el);

            this.$el.find('#addSearchResultPlaylistOptionsView').replaceWith(this.addSearchResultPlaylistOptionsView.render().el);

            this.streamItemCount = this.$el.find('.addItemOption.stream span.item-count');
            this.selectedItemsMessage = this.$el.find('span.selectedItemsMessage');

            console.log("Set selectedItemsMessage");

            this.panel = this.$el.find('.panel');
            
            this.initializeTooltips();

            return this;
        },
        
        initialize: function() {
            this.listenTo(VideoSearchResults, 'change:selected', this.hideOrUpdate);
            this.listenTo(this.model, 'destroy', this.hide);
            
            this.addSearchResultPlaylistOptionsView = new AddSearchResultPlaylistOptionsView({
                model: this.model.get('folder').get('playlists')
            });
        },
        
        hideOrUpdate: function() {
          
            if (VideoSearchResults.selected().length === 0) {
                this.model.destroy();
            } else {
                this.updateSelectedItemsMessage();
            }

        },
        
        updateSelectedItemsMessage: function() {

            var selectedCount = VideoSearchResults.selected().length;
            
            if (selectedCount === 1) {
                //  TODO: i18n:
                this.selectedItemsMessage.text('Add ' + selectedCount + ' item to:');
            } else {
                this.selectedItemsMessage.text('Add ' + selectedCount + ' items to:');
            }

        },
        
        show: function (instant) {
            return false;
            //  Store original values in data attribute to be able to revert without magic numbers.
            this.$el.data('backgroundColor', this.$el.css('background-color')).transition({
                'background-color': 'rgba(0, 0, 0, 0.5)'
            }, instant ? 0 : undefined, 'snap');

            this.panel.transition({
                x: -1 * this.$el.width()
            }, instant ? 0 : undefined, 'snap');

        },
        
        destroyModel: function () {
            this.model.destroy();
        },

        hide: function () {

            this.$el.transition({
                'background-color': this.$el.data('backgroundColor')
            }, function () {
                this.remove();
            }.bind(this));

            this.panel.transition({
                x: 0
            }, 'snap');

        }

    });

    return AddSearchResultsView;
});