define([
    'common/enum/listItemType',
    'foreground/view/behavior/tooltip'
], function (ListItemType, Tooltip) {
    'use strict';

    var ListItemButtonView = Marionette.ItemView.extend({
        tagName: 'button',
        className: function () {
            //  TODO: Should probably use the same size icon for both..
            return 'js-tooltipable listItem-button button--icon button--icon--secondary ' + this._getSize();
        },
        
        events: {
            'click': '_onClick',
            'dblclick': '_onDblClick'
        },
        
        behaviors: {
            Tooltip: {
                behaviorClass: Tooltip
            }
        },
        
        initialize: function () {
            //  Debounced to defend against accidental/spam clicking. Bound in initialize because
            //  the debounce timer will be shared between all ListItemButtonViews if bound before initialize.
            this._doOnClickAction = _.debounce(function() {
                if (!this.$el.hasClass('disabled')) {
                    this.doOnClickAction();
                }
            }.bind(this), 1000, true);
        },

        _onClick: function () {
            this._doOnClickAction();
            //  Don't allow click to bubble up since handling click at this level.
            return false;
        },
        
        _onDblClick: function () {
            this._doOnClickAction();
            //  Don't allow dblClick to bubble up since handling click at this level.
            return false;
        },

        _doOnClickAction: null,

        _getSize: function () {
            var listItemType = this.model.get('listItemType');
            return listItemType === ListItemType.Playlist ? 'button--small' : 'button--medium';
        }
    });

    return ListItemButtonView;
});