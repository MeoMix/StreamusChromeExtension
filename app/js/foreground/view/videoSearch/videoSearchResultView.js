define([
    'text!../template/videoSearchResult.htm',
    'contextMenuGroups',
    'videoSearchResults',
    'streamItems',
    'folders'
], function (VideoSearchResultTemplate, ContextMenuGroups, VideoSearchResults, StreamItems, Folders) {
    'use strict';

    var VideoSearchResultView = Backbone.View.extend({
        
        className: 'listItem videoSearchResult',

        template: _.template(VideoSearchResultTemplate),
        
        attributes: function () {
            return {
                'data-videoid': this.model.get('video').get('id')
            };
        },
        
        index: -1,
        
        events: {
            'click i.playInStream': 'playInStream',
            'click i.addToStream': 'addToStream',
            'click i.addToActivePlaylist': 'addToActivePlaylist',
            'contextmenu': 'showContextMenu'
        },

        render: function () {

            this.$el.html(this.template(
                _.extend(this.model.toJSON(), {
                    //  Mix in chrome to reference internationalize.
                    'chrome.i18n': chrome.i18n,
                    'index': this.index
                })
            ));

            this.setHighlight();
            
            this.$el.find('[title]').qtip({
                position: {
                    viewport: $(window)
                },
                style: {
                    classes: 'qtip-light qtip-shadow'
                }
            });

            return this;
        },
        
        initialize: function (options) {

            this.index = options.index;

            this.listenTo(this.model, 'change:selected', this.setHighlight);
            this.listenTo(this.model, 'destroy', this.remove);
        },
        
        setHighlight: function () {
            this.$el.toggleClass('selected', this.model.get('selected'));
        },
        
        playInStream: function () {
            
            var video = this.model.get('video');
            StreamItems.addByVideo(video, true);
            
            //  Don't open up the AddSearchResults panel
            return false;
        },
        
        addToStream: function() {
          
            var video = this.model.get('video');
            StreamItems.addByVideo(video, false);
            
            //  Don't open up the AddSearchResults panel
            return false;
        },
        
        addToActivePlaylist: function () {
            
            var video = this.model.get('video');
            Folders.getActiveFolder().getActivePlaylist().addByVideo(video);
            
            //  Don't open up the AddSearchResults panel
            return false;
        },
        
        showContextMenu: function (event) {

            var video = this.model.get('video');
            
            event.preventDefault();

            ContextMenuGroups.reset();
            
            ContextMenuGroups.add({
                items: [{
                    text: chrome.i18n.getMessage('play'),
                    onClick: function () {
                        StreamItems.addByVideo(video, true);
                    }
                }, {
                    text: chrome.i18n.getMessage('add'),
                    onClick: function () {
                        StreamItems.addByVideo(video, false);
                    }
                }, {
                    text: chrome.i18n.getMessage("copyUrl"),
                    onClick: function () {
                        chrome.extension.sendMessage({
                            method: 'copy',
                            text: 'http://youtu.be/' + video.get('id')
                        });
                    }
                }, {
                    text: chrome.i18n.getMessage("copyTitleAndUrl"),
                    onClick: function () {

                        chrome.extension.sendMessage({
                            method: 'copy',
                            text: '"' + video.get('title') + '" - http://youtu.be/' + video.get('id')
                        });
                    }
                }]
            });

        }
    });

    return VideoSearchResultView;
});