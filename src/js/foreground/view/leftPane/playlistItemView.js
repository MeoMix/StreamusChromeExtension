define([
    'foreground/view/listItemView',
    'foreground/view/behavior/itemViewMultiSelect',
    'foreground/view/element/spinnerView',
    'foreground/view/listItemButton/addSongButtonView',
    'foreground/view/listItemButton/deleteSongButtonView',
    'foreground/view/listItemButton/playSongButtonView',
    'text!template/leftPane/playlistItem.html'
], function (ListItemView, ItemViewMultiSelect, SpinnerView, AddSongButtonView, DeleteSongButtonView, PlaySongButtonView, PlaylistItemTemplate) {
    'use strict';

    var PlaylistItemView = ListItemView.extend({
        className: ListItemView.prototype.className + ' playlist-item listItem--medium listItem--hasButtons listItem--selectable',
        template: _.template(PlaylistItemTemplate),

        events: _.extend({}, ListItemView.prototype.events, {
            'dblclick': '_onDblClick'
        }),
        
        modelEvents: {
            'change:id': '_onChangeId'
        },
        
        behaviors: _.extend({}, ListItemView.prototype.behaviors, {
            ItemViewMultiSelect: {
                behaviorClass: ItemViewMultiSelect
            }
        }),
        
        buttonViews: [PlaySongButtonView, AddSongButtonView, DeleteSongButtonView],
        
        streamItems: null,
        player: null,

        initialize: function() {
            this.streamItems = Streamus.backgroundPage.stream.get('items');
            this.player = Streamus.backgroundPage.player;
        },
        
        onRender: function () {
            var spinnerView = new SpinnerView({
                className: 'overlay u-marginAuto'
            });
            this.spinnerRegion.show(spinnerView);

            this._setShowingSpinnerClass();
        },
        
        showContextMenu: function () {
            Streamus.channels.contextMenu.commands.trigger('reset:items', [{
                text: chrome.i18n.getMessage('copyUrl'),
                onClick: this._copyUrl.bind(this)
            }, {
                text: chrome.i18n.getMessage('copyTitleAndUrl'),
                onClick: this._copyTitleAndUrl.bind(this)
            }, {
                text: chrome.i18n.getMessage('watchOnYouTube'),
                onClick: this._watchOnYouTube.bind(this)
            }]);
        },
        
        _onDblClick: function () {
            this._playInStream();
        },
        
        _onChangeId: function() {
            this._setDataId();
            this._setShowingSpinnerClass();
        },
        
        //  If the playlistItem hasn't been successfully saved to the server -- show a spinner over the UI.
        _setShowingSpinnerClass: function () {
            this.$el.toggleClass('is-showingSpinner', this.model.isNew());
        },
        
        _setDataId: function () {
            this.$el.data('id', this.model.get('id'));
        },
        
        _copyUrl: function () {
            this.model.get('song').copyUrl();
        },
        
        _copyTitleAndUrl: function () {
            this.model.get('song').copyTitleAndUrl();
        },
        
        _playInStream: function () {
            this.streamItems.addSongs(this.model.get('song'), {
                playOnAdd: true
            });
        },
        
        _watchOnYouTube: function () {
            this.player.watchInTab(this.model.get('song'));
        }
    });

    return PlaylistItemView;
});