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
            height: 360,
            width: 640
        },

        context: null,
        videoDefaultImage: new Image(640, 360),
        animationFrameRequestId: null,
        port: chrome.runtime.connect({
            name: 'videoViewPort'
        }),
        
        render: function () {
            console.log("Rendering - doingDrawingAction.");
            
            this.setClickable();

            if (!window) {
                chrome.extension.getBackgroundPage().console.error("should NOT be writing without view visible");
                return this;
            }

            if (StreamItems.length > 0) {

                var playerState = Player.get('state');

                if (playerState == PlayerState.Playing) {
                    this.startDrawing();
                } else if (Player.get('currentTime') > 0) {
                    //  The player might open while paused. Render the current video frame, but don't continously render until play starts.
                    this.getImageAndUpdate();
                } else {
                    this.drawDefaultImage();
                }

            } else {
                this.drawDefaultImage();
            }

            return this;
        },

        initialize: function() {

            this.context = this.el.getContext('2d');
            //  TODO: continous drawing is starting up multiple times because it fires when these event handlers run below
            //  but it doesn't make sense to draw unless the view is actually rendered...
            console.log("Adding iframe eventListener...");
            this.port.onMessage.addListener(function (message) {
                
                if (message.dataUrl !== undefined) {
                    this.drawImageFromSrc(message.dataUrl);
                }

            }.bind(this));
            
            this.setVideoDefaultImageSource();
            this.listenTo(Player, 'change:loadedVideoId', this.setVideoDefaultImageSource);
            this.listenTo(Player, 'change:state', this.render);
            this.listenTo(StreamItems, 'add addMultiple empty change:selected', this.render);
        },
        
        setVideoDefaultImageSource: function() {
            var loadedVideoId = Player.get('loadedVideoId');
            
            //  TODO: What if it IS empty and this is called? Should I remove src attr?
            if (loadedVideoId != '') {
                this.videoDefaultImage.src = 'http://i2.ytimg.com/vi/' + loadedVideoId + '/mqdefault.jpg ';
            }

        },
        
        stopDrawing: function () {
            console.log("I AM NOW STOPPING DRAWING:", this.animationFrameRequestId);
            if (this.animationFrameRequestId !== null) {
                window.cancelAnimationFrame(this.animationFrameRequestId);
                this.animationFrameRequestId = null;
            }
        },
        
        //  Clear the canvas by painting over it with black or draw the default video image if one is loaded
        //  TODO: Perhaps something more visually appealing / indicative than black fill?
        drawDefaultImage: function () {
            //  Don't draw over the default image with streaming content.
            this.stopDrawing();
            
            //  TODO: I think there's a race condition here where videoDefaultImage might not be loaded?
            var loadedVideoId = Player.get('loadedVideoId');

            console.log("LoadedVideoId:", loadedVideoId);

            if (loadedVideoId === '') {
                this.drawBlankImage();
            } else {
                this.context.drawImage(this.videoDefaultImage, 0, 0, this.el.width, this.el.height);
            }
            
        },
        
        drawBlankImage: function() {
            this.context.rect(0, 0, this.el.width, this.el.height);
            this.context.fillStyle = 'black';
            this.context.fill();
        },
        
        //  TODO: I feel like it would be more efficient to render an image using the byte array rather than redrawing the image.
        drawImageFromSrc: function (imageSource) {
            var image = new Image();
            image.onload = function () {
                this.context.drawImage(image, 0, 0, this.el.width, this.el.height);
            }.bind(this);
            image.src = imageSource;
        },
        
        //disconnectPort: function() {
        //    if (this.port !== null) {
        //        this.port.disconnect();
        //        this.port = null;
        //    }
        //},
        
        startDrawing: function() {
            if (this.animationFrameRequestId === null) {
                this.drawContinously();
            } else {
                console.error("Can't start drawing -- already drawing.");
            }
        },
        
        //  Request an animation frame and continously loop the drawing of images onto the canvas.
        drawContinously: function () {
            console.log("Draw continously...");
 
            this.animationFrameRequestId = window.requestAnimationFrame(function () {
                this.drawContinously();
                this.getImageAndUpdate();
            }.bind(this));
        },
        
        //  Post a message to the YouTube iframe indicating a desire for the current video frame.
        //  The post message response event handler will then cause the frame to be rendered.
        getImageAndUpdate: function () {
            this.port.postMessage({
                getData: true
            });
        },
        
        setClickable: function() {
            var streamItemExists = StreamItems.length > 0;
            this.$el.toggleClass('clickable', streamItemExists);
        },
        
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