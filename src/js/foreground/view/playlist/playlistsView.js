define(function(require) {
    'use strict';

    var ListItemType = require('common/enum/listItemType');
    var Scrollable = require('foreground/view/behavior/scrollable');
    var Tooltipable = require('foreground/view/behavior/tooltipable');
    var PlaylistView = require('foreground/view/playlist/playlistView');
    var PlaylistsTemplate = require('text!template/playlist/playlists.html');

    var PlaylistsView = Marionette.CompositeView.extend({
        id: 'playlists',
        className: 'list u-flex--full',
        template: _.template(PlaylistsTemplate),

        childView: PlaylistView,
        childViewContainer: '@ui.listItems',
        childViewType: ListItemType.Playlist,
        childViewOptions: function() {
            return {
                type: this.childViewType,
                parentId: this.ui.listItems[0].id
            };
        },

        //  Overwrite resortView to only render children as expected
        resortView: function() {
            this._renderChildren();
        },

        ui: {
            listItems: '[data-ui~=listItems]'
        },

        triggers: {
            'click @ui.listItems': 'click:listItems'
        },

        behaviors: {
            Tooltipable: {
                behaviorClass: Tooltipable
            },
            Scrollable: {
                behaviorClass: Scrollable
            }
        },

        onRender: function() {
            this.ui.listItems.sortable(this._getSortableOptions());
        },

        _getSortableOptions: function() {
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
        _onSortableUpdate: function(event, ui) {
            this.collection.moveToIndex(ui.item.data('id'), ui.item.index());
        }
    });

    return PlaylistsView;
});