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
        
        events: {
            'click': '_onClick',
            'dblclick': '_onClick'
        },
        
        behaviors: {
            Tooltip: {
                behaviorClass: Tooltip
            }
        },
        
        //  Debounced to defend against accidental/spam clicking.
        _onClick: _.debounce(function () {
            if (!this.$el.hasClass('disabled')) {
                this.doOnClickAction();
            }

            //  Don't allow click to bubble up to the list item and cause a selection.
            return false;
        }, 100, true),

        _getSize: function () {
            var listItemType = this.model.get('listItemType');
            return listItemType === ListItemType.Playlist ? 'button--small' : 'button--medium';
        }
    });

    return ListItemButtonView;
});