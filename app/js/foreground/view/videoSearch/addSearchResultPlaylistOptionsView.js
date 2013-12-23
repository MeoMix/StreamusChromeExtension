define([
    'text!template/addSearchResultPlaylistOptions.htm',
    'foreground/view/genericScrollableView',
    'foreground/model/addSearchResultOption',
    'foreground/view/videoSearch/addSearchResultOptionView',
    'enum/addSearchResultOptionType'
], function (AddSearchResultPlaylistOptionsTemplate, GenericScrollableView, AddSearchResultOption, AddSearchResultOptionView, AddSearchResultOptionType) {
    'use strict';

    var AddSearchResultPlaylistOptionsView = GenericScrollableView.extend({

        template: _.template(AddSearchResultPlaylistOptionsTemplate),
        
        className: 'list',

        render: function () {

            this.$el.html(this.template());

            var addSearchResultPlaylistOptions= this.model.map(function (playlist) {

                var addSearchResultOptionView = new AddSearchResultOptionView({
                    model: new AddSearchResultOption({
                        title: playlist.get('title'),
                        entity: playlist,
                        type: AddSearchResultOptionType.Playlist
                    })
                });

                return addSearchResultOptionView.render().el;

            });

            this.$el.append(addSearchResultPlaylistOptions);

            this.bindDroppable('.videoSearchResult');

            this.initializeTooltips();

            return this;
        },

        initialize: function () {
            this.listenTo(this.model, 'add', this.addPlaylistOption);
        },

        addPlaylistOption: function (addedPlaylist) {

            var playlistAddSearchResultOption = new AddSearchResultOption({
                title: addedPlaylist.get('title'),
                entity: addedPlaylist,
                type: AddSearchResultOptionType.Playlist
            });

            var playlistAddSearchResultOptionView = new AddSearchResultOptionView({
                model: playlistAddSearchResultOption
            });

            this.$el.append(playlistAddSearchResultOptionView.render().el);
        }

    });

    return AddSearchResultPlaylistOptionsView;
});