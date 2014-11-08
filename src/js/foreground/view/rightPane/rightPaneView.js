//  This view is intended to house all of the player controls (play, pause, etc) as well as the StreamView
define([
    'foreground/model/adminMenuArea',
    'foreground/model/timeArea',
    'foreground/view/rightPane/adminMenuAreaView',
    'foreground/view/rightPane/nextButtonView',
    'foreground/view/rightPane/playPauseButtonView',
    'foreground/view/rightPane/previousButtonView',
    'foreground/view/rightPane/streamView',
    'foreground/view/rightPane/timeAreaView',
    'foreground/view/rightPane/volumeAreaView',
    'text!template/rightPane/rightPane.html'
], function (AdminMenuArea, TimeArea, AdminMenuAreaView, NextButtonView, PlayPauseButtonView, PreviousButtonView, StreamView, TimeAreaView, VolumeAreaView, RightPaneTemplate) {
    'use strict';

    var RightPaneView = Backbone.Marionette.LayoutView.extend({
        id: 'rightPane',
        className: 'rightPane column u-flex--column',
        template: _.template(RightPaneTemplate),
        
        regions: {
            contentRegion: '#rightPane-contentRegion',
            timeAreaRegion: '#rightPane-timeAreaRegion',
            volumeAreaRegion: '#rightPane-volumeAreaRegion',
            adminMenuAreaRegion: '#rightPane-adminMenuAreaRegion',
            previousButtonRegion: '#rightPane-previousButtonRegion',
            playPauseButtonRegion: '#rightPane-playPauseButtonRegion',
            nextButtonRegion: '#rightPane-nextButtonRegion'
        },
        
        onShow: function () {
            this.timeAreaRegion.show(new TimeAreaView({
                model: new TimeArea()
            }));

            this.volumeAreaRegion.show(new VolumeAreaView());

            this.adminMenuAreaRegion.show(new AdminMenuAreaView({
                model: new AdminMenuArea()
            }));

            this.previousButtonRegion.show(new PreviousButtonView({
                model: Streamus.backgroundPage.previousButton
            }));
            
            this.playPauseButtonRegion.show(new PlayPauseButtonView({
                model: Streamus.backgroundPage.playPauseButton
            }));
            
            this.nextButtonRegion.show(new NextButtonView({
                model: Streamus.backgroundPage.nextButton
            }));

            //  IMPORTANT: This needs to be appended LAST because top content is flexible which will affect this element's height.
            this.contentRegion.show(new StreamView());
        }
    });

    return RightPaneView;
});