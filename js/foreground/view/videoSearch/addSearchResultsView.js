define([
    'text!../template/addSearchResults.htm',
    'streamItems',
    'videoSearchResults',
    'addSearchResultOption',
    'addSearchResultOptionView',
    'addSearchResultOptionType',
    'utility'
], function (AddSearchResultsTemplate, StreamItems, VideoSearchResults, AddSearchResultOption, AddSearchResultOptionView, AddSearchResultOptionType, Utility) {
    'use strict';

    var AddSearchResultsView = Backbone.View.extend({

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

            return this;
        },
        
        initialize: function() {
            this.listenTo(VideoSearchResults, 'change:selected', this.updateSelectedItemsMessage);
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
            console.log("Appended option");

        },
        
        updateSelectedItemsMessage: function() {

            var selectedCount = VideoSearchResults.selected().length;
            
            if (selectedCount === 1) {
                this.selectedItemsMessage.text('Add ' + selectedCount + ' item to:');
            } else {
                this.selectedItemsMessage.text('Add ' + selectedCount + ' items to:');
            }

        },
        
        // TODO: Should this show slide it in from the right side instead of fading it in?
        show: function () {

            this.$el.show().transition({
                opacity: 1
            }, 400);

            this.panel.transition({
                right: 0
            }, 400, 'ease');

        },
        
        destroyModel: function () {
            this.model.destroy();
        },

        hide: function () {
            var self = this;
            
            this.panel.transition({
                right: -250
            }, 400, 'ease');

            this.$el.transition({
                opacity: 0
            }, 400, function () {
                self.remove();
            });

        },
        
        doAutoScroll: function (event) {

            var scrollElement = $(event.target);
            var direction = scrollElement.data('direction');

            this.list.autoscroll({
                direction: direction,
                step: 150,
                scroll: true
            });

            var pageX = event.pageX;
            var pageY = event.pageY;
            
            //  Keep track of pageX and pageY while the mouseMoveInterval is polling.
            this.list.on('mousemove', function (mousemoveEvent) {
                pageX = mousemoveEvent.pageX;
                pageY = mousemoveEvent.pageY;
            });

            //  Causes the droppable hover to stay correctly positioned.
            this.scrollMouseMoveInterval = setInterval(function() {

                var mouseMoveEvent = $.Event('mousemove');
                
                mouseMoveEvent.pageX = pageX;
                mouseMoveEvent.pageY = pageY;

                $(document).trigger(mouseMoveEvent);
            }, 100);

        },
        
        stopAutoScroll: function () {
            this.list.autoscroll('destroy');
            this.list.off('mousemove');
            clearInterval(this.scrollMouseMoveInterval);
        }

    });

    return AddSearchResultsView;
});