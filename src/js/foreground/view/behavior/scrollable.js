define(function () {
    'use strict';

    var Scrollable = Marionette.Behavior.extend({
        ui: {
            list: '.list'
        },
        
        onShow: function () {
            //  More info: https://github.com/noraesae/perfect-scrollbar
            //  This needs to be ran during onShow for perfectScrollbar to do its math properly.
            this.ui.list.perfectScrollbar({
                suppressScrollX: true
            });
        },
        
        onAddChild: function () {
            this._updateScrollbar();
        },
        
        onRemoveChild: function () {
            this._updateScrollbar();
        },
        
        _updateScrollbar: function () {
            //  When the CollectionView is first initializing onAddChild/onRemoveChild can fire before perfectScrollbar has been initialized.
            if (this.view._isShown) {
                this.ui.list.perfectScrollbar('update');
            }
        }
    });

    return Scrollable;
});