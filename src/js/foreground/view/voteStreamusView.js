define([
    'text!template/voteStreamus.html'
], function (VoteStreamusTemplate) {
    'use strict';
    
    var Settings = chrome.extension.getBackgroundPage().Settings;
    
    var VoteStreamusView = Backbone.Marionette.ItemView.extend({
        className: 'vote-streamus',

        template: _.template(VoteStreamusTemplate),
        
        templateHelpers: {
            dontRemindMeAgainMessage: chrome.i18n.getMessage('dontRemindMeAgain')
        },
        
        events: {
            'click .vote-link': 'openVoteWindow'
        },
        
        ui: {
            reminderCheckbox: '.reminder input[type="checkbox"]'
        },

        doOk: function () {
            var remindVoteStreamus = !this.ui.reminderCheckbox.is(':checked');
            Settings.set('remindVoteStreamus', remindVoteStreamus);
        },
        
        openVoteWindow: function() {
            chrome.tabs.create({
                'url': 'http://competition.coshx.com/ideas/streamus-simple-streaming-music'
            });
        }
    });

    return VoteStreamusView;
});