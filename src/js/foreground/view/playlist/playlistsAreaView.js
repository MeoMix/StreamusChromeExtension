define([
    'common/enum/listItemType',
    'foreground/view/behavior/tooltip',
    'foreground/view/playlist/playlistView',
    'foreground/view/prompt/createPlaylistPromptView',
    'text!template/playlist/playlistsArea.html'
], function (ListItemType, Tooltip, PlaylistView, CreatePlaylistPromptView, PlaylistsAreaTemplate) {
    'use strict';

    var PlaylistsAreaView = Backbone.Marionette.CompositeView.extend({
        id: 'playlistsArea',
        className: 'u-transitionable',
        template: _.template(PlaylistsAreaTemplate),
        childView: PlaylistView,
        childViewContainer: '@ui.childContainer',
        
        childViewOptions: {
            type: ListItemType.Playlist
        },

        //  Overwrite resortView to only render children as expected
        resortView: function () {
            this._renderChildren();
        },

        events: {
            'click @ui.overlay': '_onClickOverlay',
            'click @ui.hideButton': '_onClickHideButton',
            'click @ui.createPlaylistButton': '_onClickCreatePlaylistButton',
            'dblclick @ui.childContainer': '_onDblClickChildContainer'
        },
        
        ui: {
            overlay: '#playlistsArea-overlay',
            panel: '#playlistsArea-panel',
            childContainer: '#playlistsArea-listItems',
            createPlaylistButton: '#playlistsArea-createPlaylistButton',
            hideButton: '#playlistsArea-hideButton'
        },
        
        templateHelpers: {
            playlists: chrome.i18n.getMessage('playlists'),
            createPlaylist: chrome.i18n.getMessage('createPlaylist'),
            editPlaylist: chrome.i18n.getMessage('editPlaylist')
        },
        
        behaviors: {
            Tooltip: {
                behaviorClass: Tooltip
            }
        },
        
        transitionDuration: 350,
        
        onRender: function () {
            this.ui.childContainer.sortable(this._getSortableOptions());
        },
        
        show: function () {
            this.$el.addClass('is-visible');

            this.ui.overlay.transition({
                opacity: 1
            }, {
                easing: 'easeOutCubic',
                duration: this.transitionDuration
            });

            this.ui.panel.transition({
                x: 0
            }, {
                easing: 'easeOutCubic',
                duration: this.transitionDuration,
                complete: this._onPanelShowComplete.bind(this)
            });
        },
        
        hide: function () {
            this.ui.overlay.transition({
                opacity: 0
            }, {
                easing: 'easeOutCubic',
                duration: this.transitionDuration
            });

            this.ui.panel.removeClass('is-visible').transition({
                x: '-100%'
            }, {
                easing: 'easeOutCubic',
                duration: this.transitionDuration,
                complete: this._onPanelHideComplete.bind(this)
            });
        },
        
        _onPanelShowComplete: function () {
            this.ui.panel.addClass('is-visible');
        },
        
        _onPanelHideComplete: function() {
            this.$el.removeClass('is-visible');
        },
        
        _onClickHideButton: function() {
            this.hide();
        },

        _onClickOverlay: function () {
            this.hide();
        },
        
        _onClickCreatePlaylistButton: function () {
            Streamus.channels.prompt.commands.trigger('show:prompt', CreatePlaylistPromptView);
        },
        
        //  Whenever a playlist is double-clicked it will become active and the menu should hide itself.
        _onDblClickChildContainer: function () {
            this.hide();
        },
        
        _getSortableOptions: function () {
            var sortableOptions = {
                axis: 'y',
                delay: 100,
                containment: 'parent',
                tolerance: 'pointer',
                start: this._onSortableStart.bind(this),
                update: this._onSortableUpdate.bind(this)
            };

            return sortableOptions;
        },
        
        _onSortableStart: function() {
            Streamus.channels.elementInteractions.vent.trigger('drag');
        },
        
        //  Whenever a playlist is moved visually -- update corresponding model with new information.
        _onSortableUpdate: function (event, ui) {
            this.collection.moveToIndex(ui.item.data('id'), ui.item.index());
        }
    });

    return PlaylistsAreaView;
});