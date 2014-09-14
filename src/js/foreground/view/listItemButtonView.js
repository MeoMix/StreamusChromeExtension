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

        //  TODO: Rename to buttonSize ?
        _getIconSize: function () {
            var listItemType = this.model.get('listItemType');
            return listItemType === ListItemType.Playlist ? 'buttonSize-small' : 'buttonSize-base';
        }
    });

    return ListItemButtonView;
});