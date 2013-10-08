//  This view is intended to house all of the player controls (play, pause, etc) as well as the StreamView
define([
    'text!../template/rightPane.htm',
    'streamView',
    'repeatButtonView',
    'shuffleButtonView',
    'radioButtonView'
], function(RightPaneTemplate, StreamView, RepeatButtonView, ShuffleButtonView, RadioButtonView) {
    'use strict';

    var RightPaneView = Backbone.View.extend({
        
        className: 'right-pane',

        template: _.template(RightPaneTemplate),
        
        streamView: null,
        radioButtonView: null,
        shuffleButtonView: null,
        repeatButtonView: null,
        
        render: function() {
            this.$el.html(this.template());

            this.$el.find('.progress-details').after(this.streamView.render().el);

            var leftGroupContextButtons = this.$el.find('.context-buttons .left-group');

            leftGroupContextButtons.append(this.shuffleButtonView.render().el);
            leftGroupContextButtons.append(this.repeatButtonView.render().el);
            leftGroupContextButtons.append(this.radioButtonView.render().el);

            return this;
        },
        
        initialize: function (options) {

            if (options.activeFolder == null) throw "RightPaneView expects to be initialized with an activeFolder";
            
            this.streamView = new StreamView({
                model: options.activeFolder
            });
            
            //  TODO: mmm... wat? I know the models are hosted on the background page, but there's gotta be a better way to do this.
            this.radioButtonView = new RadioButtonView({
                model: chrome.extension.getBackgroundPage().RadioButton
            });
            
            this.repeatButtonView = new RepeatButtonView({
                model: chrome.extension.getBackgroundPage().RepeatButton
            });

            this.shuffleButtonView = new ShuffleButtonView({
                model: chrome.extension.getBackgroundPage().ShuffleButton
            });

        }

    });

    return RightPaneView;
})