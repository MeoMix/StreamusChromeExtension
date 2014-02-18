define([
    'foreground/model/foregroundViewManager',
    'text!template/saveVideos.html',
    'foreground/collection/playlists'
], function (ForegroundViewManager, SaveVideosTemplate, Playlists) {
    'use strict';

    var SaveVideosView = Backbone.Marionette.ItemView.extend({

        className: 'saveVideos',
        
        template: _.template(SaveVideosTemplate),

        creating: false,
        
        templateHelpers: {
            typeToCreateOrFilterPlaylistsMessage: chrome.i18n.getMessage('typeToCreateOrFilterPlaylists')
        },
        
        ui: {
            playlistSelect: 'select.submittable',
            selectizeTitle: '.selectize-input span.title'
        },
        
        videos: [],
        
        onRender: function () {
            var playlistOptions = Playlists.map(function (playlist) {
                return {
                    id: playlist.get('id'),
                    title: playlist.get('title'),
                    displayInfo: playlist.get('displayInfo')
                };
            });

            var activePlaylistId = Playlists.getActivePlaylist().get('id');
            
            this.ui.playlistSelect.selectize({
                //  If false, items created by the user will not show up as available options once they are unselected.
                persist: false,
                maxItems: 1,
                mode: 'multi',
                //  The name of the property to use as the "value" when an item is selected.
                valueField: 'id',
                //  The name of the property to render as an option / item label.
                labelField: 'title',
                //  An array of property names to analyze when filtering options.
                searchField: ['title'],
                options: playlistOptions,
                //  This plugin adds classic a classic remove button to each item for behavior that mimics Select2 and Chosen.
                plugins: ['remove_button'],
                render: {
                    item: function (item, escape) {
                        return '<div>' + '<span class="title">' + escape(item.title) + '</span>' + '</div>';
                    },
                    option: function (item, escape) {

                        var className = item.id === activePlaylistId ? 'selected' : '';
                        var option = '<div class="' + className + '">';

                        option += '<span class="label">' + escape(item.title) + '</span>';
                        option += '<span class="caption">' + escape(item.displayInfo) + '</span>';

                        option += '</div>';

                        return option;
                    }
                },
                create: function (input) {

                    var createResult = false;
                    var trimmedInput = $.trim(input);

                    if (trimmedInput !== '') {
                        createResult = {
                            id: _.uniqueId('newPlaylist_'),
                            title: trimmedInput
                        };
                    }

                    this.creating = true;
                    this.trigger('change:creating', this.creating);

                    return createResult;
                }.bind(this),
                onDelete: function() {
                    this.creating = false;
                    this.trigger('change:creating', this.creating);
                }.bind(this)
            });
        },
        
        initialize: function (options) {
            this.videos = options.videos || this.videos;
            ForegroundViewManager.subscribe(this);
        },
        
        validate: function() {
            var selectedPlaylistId = this.ui.playlistSelect.val();
            var isValid = selectedPlaylistId !== null && selectedPlaylistId.length > 0;

            return isValid;
        },
        
        doOk: function () {
            var selectedPlaylistId = this.ui.playlistSelect.val();

            if (this.creating) {
                var playlistTitle = this.ui.selectizeTitle.text();
                Playlists.addPlaylistWithVideos(playlistTitle, this.videos);
            } else {
                var selectedPlaylist = Playlists.get(selectedPlaylistId);
                selectedPlaylist.addByVideos(this.videos);
            }
        }
        
    });

    return SaveVideosView;
});