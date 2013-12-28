define([
    'foreground/view/genericForegroundView',
    'foreground/collection/streamItems',
    'foreground/model/player',
    'enum/playerState',
    'foreground/collection/contextMenuGroups'
], function(GenericForegroundView, StreamItems, Player, PlayerState, ContextMenuGroups) {
    'use strict';

    var VideoView = GenericForegroundView.extend({
        
        tagName: 'canvas',        

        events: {
            'click': 'togglePlayerState',
            'dblclick': 'goFullScreen',
            //'contextmenu': 'showContextMenu'
        },
        
        attributes: {
            height: "473",
            width: "630"
        },

        context: null,
        videoDefaultImage: new Image(),
        port: null,
        
        render: function () {

            this.draw();

            console.log("Connecting to iframe...");

            this.port = chrome.runtime.connect({
                name: 'videoViewPort'
            });
            
            this.port.onMessage.addListener(function (message) {
                console.log('port onMessage:', message);

                //  TODO: I'm drawing an image when I feel like I should be able to do it with image data...

                var image = new Image();
                image.onload = function () {
                    this.context.drawImage(image, 0, 0, this.el.width, this.el.height);
                }.bind(this);
                image.src = message.dataUrl;

            }.bind(this));

            return this;
        },

        initialize: function() {

            this.context = this.el.getContext('2d');
  
            this.videoDefaultImage.onload = function () {
                this.context.drawImage(this.videoDefaultImage, 0, 0, this.el.width, this.el.height);
            }.bind(this);

            this.listenTo(Player, 'change:loadedVideoId', function () {
                var loadedVideoId = Player.get('loadedVideoId');

                if (loadedVideoId != '') {
                    this.videoDefaultImage.src = 'http://i2.ytimg.com/vi/' + loadedVideoId + '/mqdefault.jpg ';
                }
            });
            
            //this.listenTo(Player, 'change:state', this.draw);
            //this.listenTo(StreamItems, 'add addMultiple empty change:selected', this.draw);
            
            //  Cleanup port connection whenever foreground closes to ensure that iframe doesn't pump data to nowhere.
            $(window).unload(function () {
                this.disconnectPort();
            }.bind(this));

        },
        
        drawImage: function() {
            //var image = new Image();
            //image.onload = function () {
            //    this.context.drawImage(image, 0, 0);
            //}.bind(this);
            //image.src = Player.get('canvasDataUrl');
        },
        
        disconnectPort: function() {
            if (this.port !== null) {
                this.port.disconnect();
                this.port = null;
            }
        },
        
        draw: function() {

            //window.requestAnimationFrame(function() {
            //    this.draw();

            //    this.port.postMessage({
            //        getData: true
            //    });

            //}.bind(this));

        },

        
        //draw: function () {

        //    var self = this;
            
        //    //  No reason to draw if there's nothing visible.
        //    if (window != null) {

        //        var streamItemExists = StreamItems.length > 0;
        //        this.$el.toggleClass('clickable', streamItemExists);

        //        if (streamItemExists) {

        //            var playerState = Player.get('state');

        //            if (playerState == PlayerState.Playing) {
                        
        //                //  Continously render if playing.
        //                window.requestAnimationFrame(function() {

        //                    //  TODO: For some reason if I just let this render infinitely it starts going black... but why?
        //                    //if (self.$el.is(':visible')) {
        //                        self.draw();
        //                    //}

        //                });


        //                this.drawImage();
        //            } else if (Player.get('currentTime') > 0) {
        //                //  The player might open while paused. Render the current video frame, but don't continously render until play starts.
        //                this.drawImage();
        //            } else {
        //                var loadedVideoId = Player.get('loadedVideoId');

        //                if (loadedVideoId != '') {
        //                    //  Be sure to clear the source because if the canvas resized with the src intact it will be white and won't refresh when setting source again.
        //                    this.videoDefaultImage.src = '';
        //                    this.videoDefaultImage.src = 'http://i2.ytimg.com/vi/' + loadedVideoId + '/mqdefault.jpg ';
        //                }
        //            }

        //        } else {

        //            setTimeout(function() {
        //                //  Clear the canvas by painting over it with black.
        //                //  TODO: Perhaps something more visually appealing / indicative than black fill?
        //                self.context.rect(0, 0, self.el.width, self.el.height);
        //                self.context.fillStyle = 'black';
        //                self.context.fill();
        //            }, 0);

        //        }
        //    }
        //},
        
        togglePlayerState: function () {

            if (StreamItems.length > 0) {

                if (Player.isPlaying()) {
                    Player.pause();

                } else {
                    Player.play();
                }

            }

        },

        goFullScreen: function () {

            //  Fullscreen detect:
            if (!window.screenTop && !window.screenY) {

                //  Exit full screen
                chrome.windows.getAll(function (windows) {

                    var window = _.findWhere(windows, { state: "fullscreen" });
                    chrome.windows.remove(window.id);

                });

            } else {
                
                var loadedVideoId = Player.get('loadedVideoId');
                var isFullScreenDisabled = loadedVideoId == '';

                if (!isFullScreenDisabled) {

                    chrome.windows.create({
                        url: "fullscreen.html",
                        type: "popup",
                        focused: true
                    }, function (window) {

                        chrome.windows.update(window.id, {
                            state: "fullscreen"
                        });

                    });

                }

            }

        },

        showContextMenu: function (event) {

            event.preventDefault();

            // Fullscreen detect:
            if (!window.screenTop && !window.screenY) {

                ContextMenuGroups.add({
                    items: [{
                        text: chrome.i18n.getMessage('exitFullScreen'),
                        onClick: function () {

                            chrome.windows.getAll(function (windows) {

                                var window = _.findWhere(windows, { state: "fullscreen" });
                                chrome.windows.remove(window.id);

                            });

                        }
                    }]
                });

            } else {
                var loadedVideoId = Player.get('loadedVideoId');
                var isFullScreenDisabled = loadedVideoId == '';

                ContextMenuGroups.add({
                    items: [{
                        text: chrome.i18n.getMessage('fullScreen'),
                        disabled: isFullScreenDisabled,
                        title: isFullScreenDisabled ? chrome.i18n.getMessage('loadVideoBeforeFullScreen') : '',
                        onClick: function () {

                            if (!isFullScreenDisabled) {

                                chrome.windows.create({
                                    url: "fullscreen.html",
                                    type: "popup",
                                    focused: true
                                }, function (window) {

                                    chrome.windows.update(window.id, {
                                        state: "fullscreen"
                                    });

                                });

                            }

                        }
                    }]
                });

            }

        }

    });

    return VideoView;
});