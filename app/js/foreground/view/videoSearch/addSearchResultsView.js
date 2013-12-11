define([
    'text!../template/addSearchResults.htm',
    'genericScrollableView',
    'streamItems',
    'videoSearchResults',
    'addSearchResultOption',
    'addSearchResultOptionView',
    'addSearchResultOptionType',
    'utility'
], function (AddSearchResultsTemplate, GenericScrollableView, StreamItems, VideoSearchResults, AddSearchResultOption, AddSearchResultOptionView, AddSearchResultOptionType, Utility) {
    'use strict';

    var AddSearchResultsView = GenericScrollableView.extend({

        template: _.template(AddSearchResultsTemplate),
        
        attributes: {
            'id': 'addSearchResults'
        },
        
        events: {
            'click #hideAddItemsButton': 'destroyModel'
        },
        
        streamItemsLength: null,
        resetStateTimeout: null,
        list: null,
        scrollMouseMoveInterval: null,
        panel: null,

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

            var playlistAddSearchResultOptionViews = this.model.get('folder').get('playlists').map(function (playlist) {

                var playlistAddSearchResultOption = new AddSearchResultOption({
                    title: playlist.get('title'),
                    entity: playlist,
                    type: AddSearchResultOptionType.PLAYLIST
                });

                var playlistAddSearchResultOptionView = new AddSearchResultOptionView({
                    model: playlistAddSearchResultOption
                });

                return playlistAddSearchResultOptionView;
            });

            var playlistAddSearchResultOptionElements = _.map(playlistAddSearchResultOptionViews, function (playlistAddSearchResultOptionView) {
                return playlistAddSearchResultOptionView.render().el;
            });

            this.list = this.$el.find('.list');

            this.list.append(playlistAddSearchResultOptionElements);

            var activePlaylistView = _.find(playlistAddSearchResultOptionViews, function (view) {
                return view.model.get('entity').get('active');
            });

            setTimeout(function() {
                activePlaylistView.render().$el.scrollIntoView(false);
            });

            this.streamItemCount = this.$el.find('.addItemOption.stream span.item-count');
            this.selectedItemsMessage = this.$el.find('span.selectedItemsMessage');

            var self = this;
            this.$el.find('.scroll').droppable({
                tolerance: 'pointer',
                accept: '.videoSearchResult',
                over: function (event) {
                    self.doAutoScroll(event);
                },
                drop: function() {
                    self.stopAutoScroll();
                },
                out: function(){
                    self.stopAutoScroll();
                }
            });

            this.panel = this.$el.find('.panel');
            
            this.$el.find('[title]:enabled').qtip({
                position: {
                    viewport: $(window)
                },
                style: {
                    classes: 'qtip-light qtip-shadow'
                }
            });

            return this;
        },
        
        initialize: function() {
            this.listenTo(VideoSearchResults, 'change:selected', this.hideOrUpdate);
            this.listenTo(this.model, 'destroy', this.hide);
            this.listenTo(this.model.get('folder').get('playlists'), 'add', this.addPlaylistOption);
            
            Utility.scrollChildElements(this.el, '.item-title');
        },
        
        addPlaylistOption: function (addedPlaylist) {

            var playlistAddSearchResultOption = new AddSearchResultOption({
                title: addedPlaylist.get('title'),
                entity: addedPlaylist,
                type: AddSearchResultOptionType.PLAYLIST
            });

            var playlistAddSearchResultOptionView = new AddSearchResultOptionView({
                model: playlistAddSearchResultOption
            });

            this.list.append(playlistAddSearchResultOptionView.render().el);
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
                this.selectedItemsMessage.text('Add ' + selectedCount + ' item to:');
            } else {
                this.selectedItemsMessage.text('Add ' + selectedCount + ' items to:');
            }

        },
        
        show: function () {

            //  Store original values in data attribute to be able to revert without magic numbers.
            this.$el.data('backgroundColor', this.$el.css('background-color')).transition({
                'background-color': 'rgba(0, 0, 0, 0.5)'
            }, 'snap');


            this.panel.transition({
                x: -1 * this.$el.width()
            }, 'snap');

        },
        
        destroyModel: function () {

            this.model.destroy();
        },

        hide: function () {
            var self = this;

            this.$el.transition({
                'background-color': this.$el.data('backgroundColor')
            }, function () {
                self.remove();
            });

            this.panel.transition({
                x: 0
            }, 'snap');

        }

    });

    return AddSearchResultsView;
});