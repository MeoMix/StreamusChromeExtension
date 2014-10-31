define([
    'foreground/view/listItemButton/listItemButtonView',
    'text!template/listItemButton/addListItemButton.html'
], function (ListItemButtonView, AddListItemButtonTemplate) {
    'use strict';

    var AddSongButtonView = ListItemButtonView.extend({
        template: _.template(AddListItemButtonTemplate),
        
        streamItems: null,
        
        initialize: function() {
            this.streamItems = Streamus.backgroundPage.stream.get('items');
            this.listenTo(this.streamItems, 'add remove reset', this._setDisabledState.bind(this));
            
            ListItemButtonView.prototype.initialize.apply(this, arguments);
        },
        
        onRender: function () {
            this._setDisabledState();
        },
        
        doOnClickAction: function () {
            var song = this.model.get('song');
            this.streamItems.addSongs(song);
        },

        _setDisabledState: function () {
            var duplicatesInfo = this.streamItems.getDuplicatesInfo(this.model.get('song'));
           
            this.$el.toggleClass('disabled', duplicatesInfo.allDuplicates);

            var title = duplicatesInfo.allDuplicates ? duplicatesInfo.message : chrome.i18n.getMessage('add');
            this.$el.attr('title', title);
        }
    });

    return AddSongButtonView;
});