define([
    'text!../template/saveVideos.htm',
    'folders'
], function (SaveVideosTemplate, Folders) {
    'use strict';

    var SaveVideosView = Backbone.View.extend({

        className: 'saveVideos',
        
        template: _.template(SaveVideosTemplate),

        creating: false,
        
        render: function () {
            
            var self = this;
            
            this.$el.html(this.template({
                'chrome.i18n': chrome.i18n
            }));
            
            var playlistOptions = Folders.getActiveFolder().get('playlists').map(function (playlist) {
                return {
                    id: playlist.get('id'),
                    title: playlist.get('title'),
                    displayInfo: playlist.get('displayInfo')
                };
            });

            this.playlistSelect = this.$el.find('select.submittable');
            
            this.playlistSelect.selectize({
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

                        return '<div>' + '<span class="title">' + escape(item.title) +'</span>' + '</div>';
                        
                    },
                    option: function (item, escape) {

                        var option = '<div>';

                        option += '<span class="label">' + escape(item.title) + '</span>';
                        option += '<span class="caption">' + escape(item.displayInfo) + '</span>';

                        option += '</div>';

                        return option;
                    }
                },
                create: function (input) {

                    var createResult = false;
                    var trimmedInput = $.trim(input);

                    if (trimmedInput != '') {
                        createResult = {
                            id: _.uniqueId('newPlaylist_'),
                            title: trimmedInput
                        };

                    }

                    self.creating = true;
                    self.trigger('change:creating', self.creating);

                    return createResult;
                },
                onDelete: function() {
                    self.creating = false;
                    self.trigger('change:creating', self.creating);
                }
            });

            return this;
        },
        
        validate: function() {

            var selectedPlaylistId = this.playlistSelect.val();

            var isValid = selectedPlaylistId !== null && selectedPlaylistId.length > 0;

            return isValid;
        },
        
        doOk: function () {
            var selectedPlaylistId = this.playlistSelect.val();

            if (this.creating) {

                var playlistTitle = this.$el.find('.selectize-input').find('span.title').text();
                Folders.getActiveFolder().addPlaylistWithVideos(playlistTitle, this.model);

            } else {

                var selectedPlaylist = Folders.getActiveFolder().get('playlists').get(selectedPlaylistId);
                selectedPlaylist.addByVideos(this.model);

            }
        }

        
    });

    return SaveVideosView;
});