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
        childViewContainer: '@ui.childContainer',
        childViewType: ListItemType.Playlist,
        childViewOptions: function() {
            return {
                type: this.childViewType,
                parentId: this.ui.childContainer[0].id
            };
        },

        //  Overwrite resortView to only render children as expected
        resortView: function() {
            this._renderChildren();
        },

        ui: function() {
            return {
                childContainer: '#' + this.id + '-listItems'
            };
        },

        triggers: {
            'click @ui.childContainer': 'click:childContainer'
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
            this.ui.childContainer.sortable(this._getSortableOptions());
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