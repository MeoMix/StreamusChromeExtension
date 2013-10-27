define([
    'text!../template/saveSelectedPrompt.htm',
    'genericPromptView',
    'folders',
    'videoSearchResults'
], function (SaveSelectedPromptTemplate, GenericPromptView, Folders, VideoSearchResults) {
    'use strict';

    var SaveSelectedPromptView = GenericPromptView.extend({

        className: GenericPromptView.prototype.className + ' saveSelectedPrompt',

        template: _.template(SaveSelectedPromptTemplate),

        events: _.extend({}, GenericPromptView.prototype.events, {
            
        }),
        
        isCreating: false,
        
        render: function () {
            
            GenericPromptView.prototype.render.call(this, {
                'selectedResultsCount': VideoSearchResults.selected().count
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
        
        doOk: function () {

            var selectedPlaylistId = this.playlistSelect.val();
            
            if (selectedPlaylistId) {

                var selectedSearchResults = VideoSearchResults.selected();

                var videoInformation;
                if (selectedSearchResults.length === 1) {
                    videoInformation = selectedSearchResults[0].get('videoInformation');
                } else {

                    videoInformation = _.map(VideoSearchResults.selected(), function (selectedVideoSearchResult) {
                        return selectedVideoSearchResult.get('videoInformation');
                    });
                    
                }
                
                if (this.isCreating) {

                    var playlistTitle = this.$el.find('.selectize-input').find('span.title').text();
                    Folders.getActiveFolder().addPlaylistByInformation(playlistTitle, videoInformation);

                } else {
                    
                    var selectedPlaylist = Folders.getActiveFolder().get('playlists').get(selectedPlaylistId);
                    selectedPlaylist.addItemByInformation(videoInformation);

                }

                this.fadeOutAndHide();
            }

        }

        
    });

    return SaveSelectedPromptView;
});