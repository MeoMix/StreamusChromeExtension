define([
    'common/enum/listItemType',
    'foreground/view/behavior/scrollable',
    'foreground/view/behavior/tooltip',
    'foreground/view/playlist/playlistView',
    'foreground/view/prompt/createPlaylistPromptView',
    'text!template/playlist/playlistsArea.html'
], function (ListItemType, Scrollable, Tooltip, PlaylistView, CreatePlaylistPromptView, PlaylistsAreaTemplate) {
    'use strict';

    var PlaylistsAreaView = Marionette.CompositeView.extend({
        id: 'playlistsArea',
        
        template: _.template(PlaylistsAreaTemplate),
        templateHelpers: {
            createPlaylist: chrome.i18n.getMessage('createPlaylist')
        },
        
        childView: PlaylistView,
        childViewContainer: '@ui.childContainer',
        childViewType: ListItemType.Playlist,
        childViewOptions: function () {
            return {
                type: this.childViewType,
                parentId: this.ui.childContainer[0].id
            };
        },

        //  Overwrite resortView to only render children as expected
        resortView: function () {
            this._renderChildren();
        },
        
        ui: function () {
            return {
                transitionable: '.u-transitionable',
                overlay: '#' + this.id + '-overlay',
                panel: '#' + this.id + '-panel',
                childContainer: '#' + this.id + '-listItems',
                createPlaylistButton: '#' + this.id + '-createPlaylistButton'
            };
        },

        events: {
            'click @ui.overlay': '_onClickOverlay',
            'click @ui.hideButton': '_onClickHideButton',
            'click @ui.createPlaylistButton': '_onClickCreatePlaylistButton',
            'dblclick @ui.childContainer': '_onDblClickChildContainer'
        },
        
        behaviors: {
            Tooltip: {
                behaviorClass: Tooltip
            },
            Scrollable: {
                behaviorClass: Scrollable
            }
        },
        
        onRender: function () {
            this.ui.childContainer.sortable(this._getSortableOptions());
        },
        
        show: function () {
            Streamus.channels.playlistsArea.vent.trigger('showing');
            this.ui.transitionable.addClass('is-visible');
        },
        
        hide: function () {
            Streamus.channels.playlistsArea.vent.trigger('hiding');
            this.ui.transitionable.removeClass('is-visible');
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
            Streamus.channels.element.vent.trigger('drag');
        },
        
        //  Whenever a playlist is moved visually -- update corresponding model with new information.
        _onSortableUpdate: function (event, ui) {
            this.collection.moveToIndex(ui.item.data('id'), ui.item.index());
        }
    });

    return PlaylistsAreaView;
});