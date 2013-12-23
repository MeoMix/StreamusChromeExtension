//  TODO: Decouple streamItems from this so it can be more easily used in fullscreen.
define([
    'foreground/view/genericForegroundView',
    'foreground/collection/streamItems',
    'foreground/model/player',
    'enum/playerState',
    'foreground/collection/contextMenuGroups',
    'text!template/videoDisplay.htm',
    'foreground/view/rightPane/videoDisplayButtonView'
], function (GenericForegroundView, StreamItems, Player, PlayerState, ContextMenuGroups, VideoDisplayTemplate, VideoDisplayButtonView) {
    'use strict';

    var VideoDisplayView = GenericForegroundView.extend({
        //tagName: 'canvas',
        
        attributes: {
            'id': 'videoDisplay'
        },

        template: _.template(VideoDisplayTemplate),

        //events: {
        //    'click': 'togglePlayerState',
        //    'dblclick': 'goFullScreen',
        //    'contextmenu': 'showContextMenu'
        //},
        
        //attributes: {
        //    height: "315",
        //    width: "560"
        //},
        
        panel: null,
        
        //videoDefaultImage: new Image(),
        
        videoDisplayButtonView: null,

        render: function () {
 
            this.$el.html(this.template(
                _.extend({
                    //  Mix in chrome to reference internationalize.
                    'chrome.i18n': chrome.i18n
                })
            ));


            this.panel = this.$el.find('.panel');
            
            ////  Stop drawing entirely when the player stops.
            //if (window != null) {

            //    var streamItemExists = StreamItems.length > 0;
            //    this.$el.toggleClass('clickable', streamItemExists);

            //    if (streamItemExists) {

            //        var playerState = Player.get('state');

            //        if (playerState == PlayerState.Playing) {
            //            //  Continously render if playing.

            //            window.requestAnimationFrame(function() {

            //                //  TODO: For some reason if I just let this render infinitely it starts going black... but why?
            //                if (self.$el.is(':visible')) {
            //                    self.render();
            //                }

            //            });

            //            this.context.drawImage(this.video, 0, 0, this.el.width, this.el.height);
            //        } else if (Player.get('currentTime') > 0) {
            //            //  The player might open while paused. Render the current video frame, but don't continously render until play starts.
            //            this.context.drawImage(this.video, 0, 0, this.el.width, this.el.height);
            //        } else {
            //            var loadedVideoId = Player.get('loadedVideoId');

            //            if (loadedVideoId != '') {
            //                //  Be sure to clear the source because if the canvas resized with the src intact it will be white and won't refresh when setting source again.
            //                this.videoDefaultImage.src = '';
            //                this.videoDefaultImage.src = 'http://i2.ytimg.com/vi/' + loadedVideoId + '/mqdefault.jpg ';
            //            }
            //        }

            //    } else {

            //        setTimeout(function() {
            //            //  Clear the canvas by painting over it with black.
            //            //  TODO: Perhaps something more visually appealing / indicative than black fill?
            //            self.context.rect(0, 0, self.el.width, self.el.height);
            //            self.context.fillStyle = 'black';
            //            self.context.fill();
            //        }, 0);

            //    }
            //}

            return this;
        },
           
        initialize: function () {

            //this.videoDisplayButtonView = new VideoDisplayButtonView({
            //    model: chrome.extension.getBackgroundPage().VideoDisplayButton
            //});

            //this.context = this.el.getContext('2d');
            //this.video = $(chrome.extension.getBackgroundPage().document).find('#YouTubeVideo')[0];

            //var self = this;
            //this.videoDefaultImage.onload = function () {
            //    self.context.drawImage(this, 0, 0, self.el.width, self.el.height);
            //};

            //this.listenTo(Player, 'change:loadedVideoId', function () {
            //    var loadedVideoId = Player.get('loadedVideoId');

            //    if (loadedVideoId != '') {

            //        self.videoDefaultImage.src = 'http://i2.ytimg.com/vi/' + loadedVideoId + '/mqdefault.jpg ';
            //    }

            //});
            //this.listenTo(Player, 'change:state', this.render);
            //this.listenTo(StreamItems, 'add addMultiple empty change:selected', this.render);
        },
        
        togglePlayerState: function () {
            
            //if (StreamItems.length > 0) {
                
            //    if (Player.isPlaying()) {
            //        Player.pause();
                    
            //    } else {
            //        Player.play();
            //    }

            //}

        },
        
        goFullScreen: function() {
                  
            //  fullscreen detect:
            //if (!window.screenTop && !window.screenY) {
            //    //  exit full screen
            //    chrome.windows.getAll(function (windows) {

            //        var window = _.findWhere(windows, { state: "fullscreen" });
            //        chrome.windows.remove(window.id);

            //    });
                
            //} else {
            //    var loadedVideoId = Player.get('loadedVideoId');
            //    var isFullScreenDisabled = loadedVideoId == '';

            //    if (!isFullScreenDisabled) {
                                
            //        chrome.windows.create({
            //            url: "fullscreen.htm",
            //            type: "popup",
            //            focused: true
            //        }, function (window) {

            //            chrome.windows.update(window.id, {
            //                state: "fullscreen"
            //            });

            //        });

            //    }
                
            //}

        },
        
        showContextMenu: function (event) {

            event.preventDefault();

            ////  fullscreen detect:
            //if (!window.screenTop && !window.screenY) {

            //    ContextMenuGroups.add({
            //        items: [{
            //            text: chrome.i18n.getMessage('exitFullScreen'),
            //            onClick: function () {

            //                chrome.windows.getAll(function (windows) {

            //                    var window = _.findWhere(windows, { state: "fullscreen" });
            //                    chrome.windows.remove(window.id);

            //                });

            //            }
            //        }]
            //    });

            //} else {
            //    var loadedVideoId = Player.get('loadedVideoId');
            //    var isFullScreenDisabled = loadedVideoId == '';

            //    ContextMenuGroups.add({
            //        items: [{
            //            text: chrome.i18n.getMessage('fullScreen'),
            //            disabled: isFullScreenDisabled,
            //            title: isFullScreenDisabled ? chrome.i18n.getMessage('loadVideoBeforeFullScreen') : '',
            //            onClick: function () {

            //                if (!isFullScreenDisabled) {

            //                    chrome.windows.create({
            //                        url: "fullscreen.htm",
            //                        type: "popup",
            //                        focused: true
            //                    }, function (window) {

            //                        chrome.windows.update(window.id, {
            //                            state: "fullscreen"
            //                        });

            //                    });

            //                }

            //            }
            //        }]
            //    });

            //}

        },
        
        show: function () {

            //  Store original values in data attribute to be able to revert without magic numbers.
            this.$el.data('background', this.$el.css('background')).transition({
                'background': 'rgba(0, 0, 0, 0.5)'
            }, 'snap');

            this.panel.transition({
                x: this.$el.width()
            }, 'snap');

        },
    });

    return VideoDisplayView;
});