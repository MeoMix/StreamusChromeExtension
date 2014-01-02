define([
    'foreground/view/genericForegroundView',
    'foreground/collection/streamItems',
    'foreground/model/player',
    'enum/playerState',
    'foreground/collection/contextMenuGroups',
    'foreground/model/buttons/playPauseButton'
], function(GenericForegroundView, StreamItems, Player, PlayerState, ContextMenuGroups, PlayPauseButton) {
    'use strict';

    var VideoView = GenericForegroundView.extend({
        
        tagName: 'canvas',        

        events: {
            'click': 'togglePlayerState',
            'dblclick': 'goFullScreen',
            'contextmenu': 'showContextMenu'
        },
        
        attributes: {
            height: 360,
            width: 640
        },
        
        animationFrameRequestId: null,
        context: null,
        port: null,
        //  This image represents the current frame of the canvas. Create the image here as an optimization
        //  since creating a new image every time the stream image function is invoked would be expensive.
        streamingImage: new Image(640, 360),
        //  This is the YouTube default image return from a YouTube video URL
        defaultImage: null,
        defaultImageLoaded: false,
        //notificationId: '',
        
        render: function () {
            console.log("VideoView is rendering");

            var streamItemExists = StreamItems.length > 0;
            this.$el.toggleClass('clickable', streamItemExists);

            if (streamItemExists) {

                var playerState = Player.get('state');

                if (playerState == PlayerState.Playing) {
                    this.startDrawing();
                } else {
                    //  Don't draw over the image with any potential streaming content.
                    this.stopDrawing();
                    
                    //  The player might open while paused. Render the current video frame.
                    if (Player.get('currentTime') > 0) {
                        this.getImageAndUpdate();
                    } else {
                        console.log("Default image:", this.defaultImage);
                        //  Video is loaded, but hasn't started. Render its default image provided by YouTube.
                        if (this.defaultImage !== null) {
                            console.log("Drawing default image:", this.el.width, this.el.height);
                            
                            if (this.defaultImageLoaded) {
                                this.context.drawImage(this.defaultImage, 0, 0, this.el.width, this.el.height);
                            } else {
                                this.defaultImage.onload = function () {
                                    this.context.drawImage(this.defaultImage, 0, 0, this.el.width, this.el.height);
                                }.bind(this);
                            }

                        } else {
                            //  The default image for the video might not load. Recover gracefully with a blank image.
                            this.drawBlankImage();
                        }
                        
                    }
                }

            } else {
                this.drawBlankImage();
            }

            return this;
        },

        initialize: function() {

            this.context = this.el.getContext('2d');
            
            this.port = chrome.runtime.connect({
                name: 'videoViewPort'
            });
            this.port.onMessage.addListener(this.drawImageFromDataURL.bind(this));
            
            this.setDefaultImage();
            this.listenTo(Player, 'change:loadedVideoId', this.setDefaultImage);
            this.listenTo(Player, 'change:state', this.render);
            this.listenTo(StreamItems, 'add addMultiple empty change:selected', this.render);
        },
        
        //  I thought it might be more efficient to use a canvas ImageData object rather than a dataURL, but
        //  the postMessage call transforms an ImageData object into a regular object, which has to be cast again.
        //  At that point I'm pretty sure it's cheaper to just use an Image.
        drawImageFromDataURL: function (imageSource) {
            this.streamingImage.src = imageSource;
            this.context.drawImage(this.streamingImage, 0, 0);
            
            //if (this.notificationId === '') {
            //    chrome.notifications.create(this.notificationId, {
            //        type: 'image',
            //        imageUrl: imageSource,
            //        iconUrl: 'http://img.youtube.com/vi/' + 'btDPtzCGNTE' + '/default.jpg',
            //        title: 'Now Playing',
            //        message: 'Hello World'
            //    }, function (createdNotificationId) {
            //        this.notificationId = createdNotificationId;
            //    }.bind(this));
            //} else {
            //    chrome.notifications.update(this.notificationId, {
            //        type: 'image',
            //        imageUrl: imageSource,
            //        iconUrl: 'http://img.youtube.com/vi/' + 'btDPtzCGNTE' + '/default.jpg',
            //        title: 'Now Playing',
            //        message: 'Hello World'
            //    }, function () {
            //        console.log("success");
            //    });
            //}
 
        },
        
        setDefaultImage: function () {
            console.log("setDefaultImage");
            this.defaultImageLoaded = false;

            var loadedVideoId = Player.get('loadedVideoId');
            
            if (loadedVideoId === '') {
                this.defaultImage = null;
            }
            else{
                this.defaultImage = new Image(640, 360);
                this.defaultImage.src = 'http://i2.ytimg.com/vi/' + loadedVideoId + '/mqdefault.jpg';

                this.defaultImage.onload = function() {
                    this.defaultImageLoaded = true;
                };

                console.log("it's set");
            }
        },
        
        //  Break the drawing animation loop by cancelling the next animation frame request.
        stopDrawing: function () {
            if (this.animationFrameRequestId !== null) {
                window.cancelAnimationFrame(this.animationFrameRequestId);
                this.animationFrameRequestId = null;
            }
        },

        //  Clear the canvas by painting over it with black 
        //  TODO: Perhaps something more visually appealing / indicative than black fill?
        drawBlankImage: function() {
            this.context.rect(0, 0, this.el.width, this.el.height);
            this.context.fillStyle = 'black';
            this.context.fill();
        },
       
        startDrawing: function() {
            if (this.animationFrameRequestId === null) {
                this.drawContinously();
            } else {
                console.error("Can't start drawing -- already drawing.");
            }
        },
        
        //  Request an animation frame and continously loop the drawing of images onto the canvas.
        drawContinously: function () {
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
        
        //  Clicking on the video player should change the state between playing and pausing.
        togglePlayerState: function () {
            PlayPauseButton.tryTogglePlayerState();
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
                
                //  Enter full screen
                var loadedVideoId = Player.get('loadedVideoId');
                var isFullScreenDisabled = loadedVideoId == '';

                if (!isFullScreenDisabled) {

                    chrome.windows.create({
                        url: 'fullscreen.html',
                        type: 'popup',
                        focused: true
                    }, function (window) {

                        console.log("opened fullscreen.html");

                        chrome.windows.update(window.id, {
                            state: 'fullscreen'
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