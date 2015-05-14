define(function(require) {
    'use strict';

    var Tooltipable = require('foreground/view/behavior/tooltipable');
    var PlaylistTitleTemplate = require('text!template/appBar/playlistTitle.html');

    var PlaylistTitleView = Marionette.ItemView.extend({
        className: 'contentBar-title text u-textOverflowEllipsis js-textTooltipable',
        template: _.template(PlaylistTitleTemplate),

        modelEvents: {
            'change:title': '_onChangeTitle'
        },

        behaviors: {
            Tooltipable: {
                behaviorClass: Tooltipable
            }
        },

        onRender: function() {
            this._setTooltipText(this.model.get('title'));
        },

        _onChangeTitle: function() {
            this.render();
        },

        _setTooltipText: function(tooltipText) {
            this.$el.attr('data-tooltip-text', tooltipText);
        }
    });

    return PlaylistTitleView;
});