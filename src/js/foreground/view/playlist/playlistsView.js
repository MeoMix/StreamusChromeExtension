define([
    'common/enum/listItemType',
    'foreground/view/behavior/scrollable',
    'foreground/view/behavior/tooltip',
    'foreground/view/playlist/playlistView',
    'text!template/playlist/playlists.html'
], function (ListItemType, Scrollable, Tooltip, PlaylistView, PlaylistsTemplate) {
    'use strict';

    var PlaylistsView = Marionette.CompositeView.extend({
        id: 'playlists',
        template: _.template(PlaylistsTemplate),
        
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
                childContainer: '#' + this.id + '-listItems'
            };
        },
        
        triggers: {
            'dblclick @ui.childContainer': 'dblclick:childContainer'
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

        _onSortableStart: function () {
            Streamus.channels.element.vent.trigger('drag');
        },

        //  Whenever a playlist is moved visually -- update corresponding model with new information.
        _onSortableUpdate: function (event, ui) {
            this.collection.moveToIndex(ui.item.data('id'), ui.item.index());
        }
    });

    return PlaylistsView;
});