define(function (require) {
    'use strict';
    
    var ListItemButtonView = require('foreground/view/listItemButton/listItemButtonView');
    var AddListItemButtonTemplate = require('text!template/listItemButton/addListItemButton.html');
    var AddIconTemplate = require('text!template/icon/addIcon_18.svg');

    var AddSongButtonView = ListItemButtonView.extend({
        template: _.template(AddListItemButtonTemplate),
        templateHelpers: {
            addIcon: _.template(AddIconTemplate)()
        },
        
        streamItems: null,
        streamItemsEvents: {
            'add': '_onStreamItemsAdd',
            'remove': '_onStreamItemsRemove',
            'reset': '_onStreamItemsReset'
        },
        
        initialize: function () {
            this.streamItems = Streamus.backgroundPage.stream.get('items');
            this.bindEntityEvents(this.streamItems, this.streamItemsEvents);
            
            ListItemButtonView.prototype.initialize.apply(this, arguments);
        },
        
        onRender: function () {
            this._setState();
        },
        
        doOnClickAction: function () {
            var song = this.model.get('song');
            this.streamItems.addSongs(song);
        },
        
        _onStreamItemsAdd: function () {
            this._setState();
        },

        _onStreamItemsRemove: function () {
            this._setState();
        },

        _onStreamItemsReset: function () {
            this._setState();
        },

        _setState: function () {
            var duplicatesInfo = this.streamItems.getDuplicatesInfo(this.model.get('song'));
           
            this.$el.toggleClass('is-disabled', duplicatesInfo.allDuplicates);

            var title = duplicatesInfo.allDuplicates ? duplicatesInfo.message : chrome.i18n.getMessage('add');
            this.$el.attr('title', title);
        }
    });

    return AddSongButtonView;
});