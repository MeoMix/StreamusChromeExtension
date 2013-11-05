define([
    'text!../template/videoSearchResult.htm',
    'contextMenuGroups',
    'videoSearchResults',
    'streamItems',
    'folders'
], function (VideoSearchResultTemplate, ContextMenuGroups, VideoSearchResults, StreamItems, Folders) {
    'use strict';

    var VideoSearchResultView = Backbone.View.extend({
        
        className: 'videoSearchResult',

        template: _.template(VideoSearchResultTemplate),
        
        attributes: function () {
            return {
                'data-videoid': this.model.get('id')
            };
        },
        
        index: -1,
        
        events: {
            'click': 'toggleSelected',
            'click i.playInStream': 'playInStream',
            'click i.addToStream': 'addToStream',
            'click i.addToActivePlaylist': 'addToActivePlaylist',
            'contextmenu': 'showContextMenu'
        },

        render: function () {

            console.log("Rendering model:", this.model, this.model.toJSON());

            this.$el.html(this.template(
                _.extend(this.model.toJSON(), {
                    //  Mix in chrome to reference internationalize.
                    'chrome.i18n': chrome.i18n,
                    'index': this.index
                })
            ));

            this.setHighlight();

            return this;
        },
        
        initialize: function (options) {

            this.index = options.index;

            this.listenTo(this.model, 'change:selected', this.setHighlight);
        },
        
        setHighlight: function () {
            this.$el.toggleClass('selected', this.model.get('selected'));
        },
        
        toggleSelected: function () {

            //  A dragged model must always be selected.
            var selected = !this.model.get('selected') || this.model.get('dragging');

            this.model.set('selected', selected);

        },
        
        playInStream: function () {
            
            var videoInformation = this.model.get('videoInformation');
            StreamItems.addByVideoInformation(videoInformation, true);

            //  Don't open up the AddSearchResults panel
            return false;
        },
        
        addToStream: function() {
          
            var videoInformation = this.model.get('videoInformation');
            StreamItems.addByVideoInformation(videoInformation, false);
            
            //  Don't open up the AddSearchResults panel
            return false;
        },
        
        addToActivePlaylist: function () {
            
            var videoInformation = this.model.get('videoInformation');
            Folders.getActiveFolder().getActivePlaylist().addByVideoInformation(videoInformation);
            
            //  Don't open up the AddSearchResults panel
            return false;
        },
        
        showContextMenu: function (event) {
            var self = this;
            var videoInformation = this.model.get('videoInformation');
            
            event.preventDefault();

            ContextMenuGroups.reset();
            
            ContextMenuGroups.add({
                items: [{
                    text: chrome.i18n.getMessage('play'),
                    onClick: function () {
                        StreamItems.addByVideoInformation(videoInformation, true);
                    }
                }, {
                    text: chrome.i18n.getMessage('add'),
                    onClick: function () {
                        StreamItems.addByVideoInformation(videoInformation, false);
                    }
                }, {
                    text: chrome.i18n.getMessage("copyUrl"),
                    onClick: function () {
                        chrome.extension.sendMessage({
                            method: 'copy',
                            text: 'http://youtu.be/' + self.model.get('id')
                        });
                    }
                }, {
                    text: chrome.i18n.getMessage("copyTitleAndUrl"),
                    onClick: function () {

                        chrome.extension.sendMessage({
                            method: 'copy',
                            text: '"' + self.model.get('title') + '" - http://youtu.be/' + self.model.get('id')
                        });
                    }
                }]
            });

        }
    });

    return VideoSearchResultView;
});