define([
    'foreground/view/genericForegroundView',
    'foreground/model/foregroundViewManager',
    'text!template/playAllButton.html',
    'foreground/collection/streamItems'
], function (GenericForegroundView, ForegroundViewManager, PlayAllButtonTemplate, StreamItems) {
    'use strict';

    //  TODO: Starting to integrate MarionetteJS. Need to support better.
    var PlayAllButtonView = Backbone.Marionette.ItemView.extend({

        tagName: 'button',

        className: 'button-label playAll',
                                
        template: _.template(PlayAllButtonTemplate),

        attributes: {
            title: chrome.i18n.getMessage('playAll')
        },
        
        events: {
            'click': function () {
                StreamItems.addByPlaylistItems(this.model.get('items'), true);
            }
        },
        
        initialize: function () {
            //  TODO: I am not certain I need a ViewManager for this if I use Marionette properly. 
            ForegroundViewManager.get('views').push(this);
            GenericForegroundView.prototype.initializeTooltips.call(this);
        }
    });
    
    return PlayAllButtonView;
});