define([
    'text!template/prompt/saveSongs.html'
], function (SaveSongsTemplate) {
    'use strict';

    var SaveSongsView = Backbone.Marionette.ItemView.extend({
        template: _.template(SaveSongsTemplate),

        templateHelpers: {
            typeToCreateOrFilterPlaylistsMessage: chrome.i18n.getMessage('typeToCreateOrFilterPlaylists')
        },
        
        ui: {
            playlistSelect: '.js-submittable',
            selectizeTitle: '.selectize-input .title'
        },
        
        playlists: null,
        
        initialize: function () {
            this.playlists = Streamus.backgroundPage.Playlists;
            console.log('Streamus.backgroundPage.Playlists:', this.playlists);
        },

        onRender: function () {
            this.ui.playlistSelect.selectize(this._getSelectizeOptions());

            //  Default the control to the active playlist since this is the most common need.
            this.ui.playlistSelect[0].selectize.setValue(this.playlists.getActivePlaylist().get('id'));

            //  Rebind UI elements after initializing selectize control in order to capture the appended DOM elements.
            this.bindUIElements();
        },
        
        saveSongs: function () {
            var selectedPlaylistId = this.ui.playlistSelect.val();

            if (this.model.get('creating')) {
                var playlistTitle = this.ui.selectizeTitle.text();
                this.playlists.addPlaylistWithSongs(playlistTitle, this.model.get('songs'));
            } else {
                var selectedPlaylist = this.playlists.get(selectedPlaylistId);
                selectedPlaylist.get('items').addSongs(this.model.get('songs'));
            }
        },
        
        _getSelectizeOptions: function () {
            var playlistOptions = this.playlists.map(function (playlist) {
                return {
                    id: playlist.get('id'),
                    title: playlist.get('title'),
                    displayInfo: playlist.get('displayInfo')
                };
            });

            var selectizeOptions = {
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
                    item: this._getSelectizeRenderItem.bind(this),
                    option: this._getSelectizeRenderOption.bind(this)
                },
                create: this._onSelectizeCreate.bind(this),
                onItemAdd: this._onSelectizeItemAdd.bind(this),
                onDelete: this._onSelectizeDelete.bind(this)
            };

            return selectizeOptions;
        },
        
        _getSelectizeRenderItem: function (item, escape) {
            return '<div>' + '<span class="title">' + escape(item.title) + '</span>' + '</div>';
        },
        
        _getSelectizeRenderOption: function (item, escape) {
            var activePlaylistId = this.playlists.getActivePlaylist().get('id');

            var className = item.id === activePlaylistId ? 'selected' : '';
            var option = '<div class="' + className + '">';

            option += '<span class="label">' + escape(item.title) + '</span>';
            option += '<span class="caption">' + escape(item.displayInfo) + '</span>';

            option += '</div>';

            return option;
        },
        
        _onSelectizeCreate: function (input) {
            var createResult = false;
            var trimmedInput = input.trim();

            if (trimmedInput !== '') {
                createResult = {
                    id: _.uniqueId('newPlaylist_'),
                    title: trimmedInput
                };
            }

            this.model.set('creating', true);

            return createResult;
        },
        
        _onSelectizeItemAdd: function () {
            //  Rebind UI elements after adding an element to selectize control in order to capture the appended DOM elements.
            this.bindUIElements();
            this.ui.playlistSelect.removeClass('is-invalid');
        },
        
        _onSelectizeDelete: function () {
            this.model.set('creating', false);
            this.ui.playlistSelect.addClass('is-invalid');
        }
    });

    return SaveSongsView;
});