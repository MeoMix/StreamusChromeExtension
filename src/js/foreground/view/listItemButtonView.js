define([
    'common/enum/listItemType',
    'foreground/view/behavior/tooltip'
], function (ListItemType, Tooltip) {
    'use strict';

    var ListItemButtonView = Backbone.Marionette.ItemView.extend({
        tagName: 'button',
        className: function () {
            return 'button-icon ' + this._getIconSize();
        },
        
        behaviors: {
            Tooltip: {
                behaviorClass: Tooltip
            }
        },

        _getIconSize: function () {
            var listItemType = this.model.get('listItemType');
            return listItemType === ListItemType.Playlist ? 'tiny' : 'small';
        }
    });

    return ListItemButtonView;
});