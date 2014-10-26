define([
    'foreground/view/listItemView',
    'foreground/view/behavior/itemViewMultiSelect',
    'foreground/view/listItemButton/deleteSongButtonView',
    'foreground/view/listItemButton/playSongButtonView',
    'foreground/view/listItemButton/saveSongButtonView',
    'text!template/rightPane/streamItem.html'
], function (ListItemView, ItemViewMultiSelect, DeleteSongButtonView, PlaySongButtonView, SaveSongButtonView, StreamItemTemplate) {
    'use strict';

    var StreamItemView = ListItemView.extend({
        className: ListItemView.prototype.className + ' stream-item listItem--medium',
        template: _.template(StreamItemTemplate),
        
        ui: _.extend({}, ListItemView.prototype.ui, {
            onActiveShown: '.is-shownOnActive'
        }),

        events: _.extend({}, ListItemView.prototype.events, {
            'dblclick': '_activateAndPlayOrToggleState'
        }),
        
        modelEvents: {
            'change:id': '_setDataId',
            'change:active': '_setActiveClass'
        },
        
        behaviors: _.extend({}, ListItemView.prototype.behaviors, {
            ItemViewMultiSelect: {
                behaviorClass: ItemViewMultiSelect
            }
        }),
        
        buttonViews: [PlaySongButtonView, SaveSongButtonView, DeleteSongButtonView],
        
        player: null,
        playPauseButton: null,
        
        initialize: function () {
            this.player = Streamus.backgroundPage.Player;
            this.playPauseButton = Streamus.backgroundPage.PlayPauseButton;
        },

        onRender: function () {
            this._setActiveClass();
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
       
        //  TODO: This is not DRY with PlaySongButtonView's _playStreamItem
        _activateAndPlayOrToggleState: function () {
            if (this.model.get('active')) {
                this.playPauseButton.tryTogglePlayerState();
            } else {
                this.player.set('playOnActivate', true);
                this.model.save({ active: true });
            }
        },
        
        _setDataId: function () {
            this.$el.data('id', this.model.get('id'));
        },

        //  Force the view to reflect the model's active class. It's important to do this here, and not through render always, because
        //  render will cause the lazy-loaded image to be reset.
        _setActiveClass: function () {
            var active = this.model.get('active');
            this.$el.toggleClass('is-active', active);
            this.ui.onActiveShown.toggleClass('hidden', !active);
        },

        _copyUrl: function () {
            this.model.get('song').copyUrl();
        },

        _copyTitleAndUrl: function () {
            this.model.get('song').copyTitleAndUrl();
        },
        _watchOnYouTube: function () {
            this.player.watchInTab(this.model.get('song'));
        }
    });

    return StreamItemView;
});
