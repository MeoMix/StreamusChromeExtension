define(function(require) {
    'use strict';

    var SelectionBar = require('foreground/model/selectionBar/selectionBar');
    var SelectionBarView = require('foreground/view/selectionBar/selectionBarView');

    var SelectionBarRegion = Marionette.Region.extend({
        initialize: function() {
            this.listenTo(Streamus.channels.foregroundArea.vent, 'idle', this._onForegroundAreaIdle);
        },

        _onForegroundAreaIdle: function() {
            var selectionBar = new SelectionBar({
                streamItems: Streamus.backgroundPage.stream.get('items'),
                searchResults: Streamus.backgroundPage.search.get('results'),
                signInManager: Streamus.backgroundPage.signInManager
            });

            this.show(new SelectionBarView({
                model: selectionBar
            }));

            this._setIsVisible(selectionBar.has('activeCollection'));
            this.listenTo(selectionBar, 'change:activeCollection', this._onSelectionBarChangeActiveCollection);
        },

        _onSelectionBarChangeActiveCollection: function(model, activeCollection) {
            this._setIsVisible(!_.isNull(activeCollection));
        },

        _setIsVisible: function(isVisible) {
            this.$el.toggleClass('is-visible', isVisible);
        }
    });

    return SelectionBarRegion;
});