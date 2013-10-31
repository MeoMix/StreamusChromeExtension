define([
    'text!../template/saveVideosPrompt.htm',
    'genericPromptView',
    'folders'
], function (SaveVideosPromptTemplate, GenericPromptView, Folders) {
    'use strict';

    var SaveVideosPromptView = GenericPromptView.extend({

        className: GenericPromptView.prototype.className + ' saveVideosPrompt',

        template: _.template(SaveVideosPromptTemplate),

        isCreating: false,
        videos: [],
        
        render: function () {
            
            GenericPromptView.prototype.render.call(this, {
                'videoCount': this.videos.length
            }, arguments);

            var playlistOptions = Folders.getActiveFolder().get('playlists').map(function (playlist) {
                return {
                    id: playlist.get('id'),
                    title: playlist.get('title'),
                    displayInfo: playlist.get('displayInfo')
                };
            });

            var self = this;

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

                    self.okButton.text(chrome.i18n.getMessage('createAndSaveButtonText'));
                    self.isCreating = true;

                    return createResult;
                },
                onDelete: function() {
                    self.okButton.text(chrome.i18n.getMessage('saveButtonText'));
                    self.isCreating = false;
                }
            });

            return this;
        },
        
        initialize: function (options) {

            if (!options.videos) throw "SaveVideosPromptView expects to be initialized with an array of videos";

            this.videos = options.videos;
        },
        
        doOk: function () {

            var selectedPlaylistId = this.playlistSelect.val();
            
            if (selectedPlaylistId) {
                
                if (this.isCreating) {
                    console.log("Creating");
                    var playlistTitle = this.$el.find('.selectize-input').find('span.title').text();
                    Folders.getActiveFolder().addPlaylistWithVideos(playlistTitle, this.videos);

                } else {
                    console.log("Saving");
                    var selectedPlaylist = Folders.getActiveFolder().get('playlists').get(selectedPlaylistId);
                    selectedPlaylist.addItems(this.videos);
      
                }

                this.fadeOutAndHide();
            }

        }

        
    });

    return SaveVideosPromptView;
});