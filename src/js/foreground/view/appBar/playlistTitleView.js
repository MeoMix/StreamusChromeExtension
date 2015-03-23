define(function(require) {
    'use strict';

    var Tooltip = require('foreground/view/behavior/tooltip');
    var PlaylistTitleTemplate = require('text!template/appBar/playlistTitle.html');

    var PlaylistTitleView = Marionette.ItemView.extend({
        className: 'contentBar-title text u-textOverflowEllipsis js-textTooltipable',
        template: _.template(PlaylistTitleTemplate),

        modelEvents: {
            'change:title': '_onChangeTitle'
        },

        behaviors: {
            Tooltip: {
                behaviorClass: Tooltip
            }
        },

        onRender: function() {
            this._setTitle(this.model.get('title'));
        },

        _onChangeTitle: function() {
            this.render();
        },

        _setTitle: function(title) {
            this.$el.attr('title', title);
        }
    });

    return PlaylistTitleView;
});