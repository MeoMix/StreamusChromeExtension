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

        _onClick: function () {
            if (!this.$el.hasClass('disabled')) {
                this.doOnClickAction();
            }

            //  Don't allow click to bubble up to the list item and cause a selection.
            return false;
        },
        
        //  Debounced to defend against accidental/spam clicking. Don't debounce _onClick directly because
        //  the debounce timer will be shared between all ListItemButtonViews and not each individual view.
        _doOnClickAction: _.debounce(function () {
            this.doOnClickAction();
        }, 1000, true),

        _getSize: function () {
            var listItemType = this.model.get('listItemType');
            return listItemType === ListItemType.Playlist ? 'button--small' : 'button--medium';
        }
    });

    return ListItemButtonView;
});