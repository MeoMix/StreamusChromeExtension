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
        className: 'u-overlay',
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
            'click': '_onClick',
            'click @ui.hideButton': '_onClickHideButton',
            'click @ui.createPlaylistButton': '_onClickCreatePlaylistButton',
            'dblclick @ui.childContainer': '_onDblClickChildContainer'
        },
        
        ui: {
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
        
        initialize: function () {
            this.listenTo(Streamus.backgroundPage.SignInManager, 'change:signedInUser', this._onSignInManagerChangeSignedInUser);
        },

        onRender: function () {
            this.ui.childContainer.sortable(this._getSortableOptions());
        },
        
        onShow: function () {
            //  Store original values in data attribute to be able to revert without magic numbers.
            this.$el.data('background', this.$el.css('background')).transition({
                'background': 'rgba(0, 0, 0, 0.5)'
            }, 'snap');

            this.ui.panel.transition({
                x: 0
            }, 300, 'snap');
        },
        
        _onClickHideButton: function() {
            this._hide();
        },
        
        //  If the user clicks the 'dark' area outside the panel -- hide the panel.
        _onClick: function (event) {
            if (event.target == event.currentTarget) {
                this._hide();
            }
        },
        
        _onClickCreatePlaylistButton: function () {
            Streamus.channels.prompt.commands.trigger('show:prompt', CreatePlaylistPromptView);
        },
        
        //  Whenever a playlist is double-clicked it will become active and the menu should hide itself.
        _onDblClickChildContainer: function () {
            this._hide();
        },
        
        //  Don't allow this view to be shown if the user is not signed in.
        _onSignInManagerChangeSignedInUser: function(model, signedInUser) {
            if (signedInUser === null) {
                this._hide(true);
            }
        },
        
        _hide: function (instant) {
            this.$el.transition({
                'background': this.$el.data('background')
            }, instant ? 0 : undefined);

            this.ui.panel.transition({
                //  Go beyond -100% for the translate in order to hide the drop shadow skirting the border of the box model.
                x: '-102%'
            }, instant ? 0 : 300, this.destroy.bind(this));
        },
        
        _getSortableOptions: function () {
            var sortableOptions = {
                axis: 'y',
                delay: 100,
                containment: 'parent',
                tolerance: 'pointer',
                update: this._onSortableUpdate.bind(this)
            };

            return sortableOptions;
        },
        
        //  Whenever a playlist is moved visually -- update corresponding model with new information.
        _onSortableUpdate: function (event, ui) {
            var playlistId = ui.item.data('id');
            var index = ui.item.index();

            var playlist = this.collection.get(playlistId);
            var originalIndex = this.collection.indexOf(playlist);

            //  When moving a playlist down - all the items shift up one which causes an off-by-one error when calling
            //  moveToIndex. Account for this by adding 1 to the index when moving down, but not when moving up since no shift happens.
            if (originalIndex < index) {
                index += 1;
            }

            this.collection.moveToIndex(playlistId, index);
        }
    });

    return PlaylistsAreaView;
});