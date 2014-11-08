define([
    'foreground/view/behavior/tooltip',
    'text!template/leftPane/playlistTitle.html'
], function (Tooltip, PlaylistTitleTemplate) {
    'use strict';

    var PlaylistTitleView = Backbone.Marionette.ItemView.extend({
        className: 'u-textOverflowEllipsis js-textTooltipable',
        template: _.template(PlaylistTitleTemplate),

        attributes: function() {
            return {
                title: this.model.get('title')
            };
        },

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