define([
    'common/enum/listItemType',
    'foreground/view/behavior/tooltip'
], function (ListItemType, Tooltip) {
    'use strict';

    var ListItemButtonView = Backbone.Marionette.ItemView.extend({
        tagName: 'button',
        className: function () {
            return 'listItem-button button--icon ' + this._getSize();
        },
        
        behaviors: {
            Tooltip: {
                behaviorClass: Tooltip
            }
        },

        _getSize: function () {
            var listItemType = this.model.get('listItemType');
            return listItemType === ListItemType.Playlist ? 'button--small' : 'button--medium';
        }
    });

    return ListItemButtonView;
});