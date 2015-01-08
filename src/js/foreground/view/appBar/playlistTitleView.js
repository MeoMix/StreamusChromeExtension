define([
    'foreground/view/behavior/tooltip',
    'text!template/appBar/playlistTitle.html'
], function (Tooltip, PlaylistTitleTemplate) {
    'use strict';

    var PlaylistTitleView = Marionette.ItemView.extend({
        className: 'appBar-text text u-textOverflowEllipsis js-textTooltipable',
        template: _.template(PlaylistTitleTemplate),

        modelEvents: {
            'change:title': '_onChangeTitle'
        },
        
        behaviors: {
            Tooltip: {
                behaviorClass: Tooltip
            }
        },
        
        onRender: function () {
            this._setTitle(this.model.get('title'));
        },
        
        _onChangeTitle: function () {
            this.render();
        },
        
        _setTitle: function (title) {
            this.$el.attr('title', title);
        }
    });

    return PlaylistTitleView;
});