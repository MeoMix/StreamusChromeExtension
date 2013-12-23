define([
   'foreground/view/genericForegroundView',
    'text!template/editPlaylist.htm'
], function (GenericForegroundView, EditPlaylistTemplate) {
    'use strict';

    var EditPlaylistView = GenericForegroundView.extend({

        className: 'editPlaylist',

        template: _.template(EditPlaylistTemplate),

        playlistTitleInput: null,
        
        events: {
            'input input.playlistTitle': 'validateTitle'
        },
        
        render: function () {

            this.$el.html(this.template({
                'chrome.i18n': chrome.i18n,
                'title': this.model.get('title')
            }));

            this.playlistTitleInput = this.$el.find('input[type="text"]');

            return this;
        },
        
        validateTitle: function () {
            //  When the user submits - check to see if they provided a playlist name
            var playlistTitle = $.trim(this.playlistTitleInput.val());
            this.playlistTitleInput.toggleClass('invalid', playlistTitle === '');
        },

        validate: function() {
            var valid = this.$el.find('.submittable.invalid').length === 0;

            return valid;
        },
        
        doOk: function () {
            var playlistTitle = $.trim(this.playlistTitleInput.val());
            this.model.set('title', playlistTitle);
        }

    });

    return EditPlaylistView;
});