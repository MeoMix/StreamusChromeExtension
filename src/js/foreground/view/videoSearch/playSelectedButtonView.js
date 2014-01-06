define([
    'foreground/view/genericForegroundView',
    'text!template/playSelectedButton.html',
    'foreground/collection/videoSearchResults',
    'foreground/collection/streamItems'
], function (GenericForegroundView, PlaySelectedButtonTemplate, VideoSearchResults, StreamItems) {
    'use strict';

    var PlaySelectedButtonView = GenericForegroundView.extend({

        tagName: 'button',

        className: 'button-label',
                                
        template: _.template(PlaySelectedButtonTemplate),
        
        attributes: {
            title: chrome.i18n.getMessage('playSelected')
        },

        events: {
            'click': 'playSelected'
        },

        render: function () {
            this.$el.html(this.template({
                'chrome.i18n': chrome.i18n
            }));
            
            return this;
        },
        
        playSelected: function () {
            var videos = _.map(VideoSearchResults.selected(), function (videoSearchResult) {
                return videoSearchResult.get('video');
            });

            StreamItems.addByVideos(videos, true);
        }
        
    });
    
    return PlaySelectedButtonView;
});