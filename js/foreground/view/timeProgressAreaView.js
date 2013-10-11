//  A progress bar which shows the elapsed time as compared to the total time of the current video.
define([
    'text!../template/timeProgressArea.htm'
], function (TimeProgressAreaTemplate) {
    'use strict';

    var TimeProgressAreaView = Backbone.View.extend({
            
        template: _.template(TimeProgressAreaTemplate),
        
        events: {
            'change input.timeRange': 'setTime'
        },
        
        progress: null,
        timeRange: null,
        
        render: function() {

            this.$el.html(this.template());
            
            //  Store references to child elements after rendering for ease of use.
            //  Progress is the shading filler for the volumeRange's value.
            this.progress = this.$el.find('.time-slider .progress');
            this.timeRange = this.$el.find('.time-slider input.timeRange');

            return this;
        },
        
        initialize: function () {
            //this.listenTo(Player, 'change:volume', this.updateProgressAndVolumeIcon);
        },
        
        setTime: function () {

            var timeValue = this.timeRange.val();

            this.progress.width(timeValue + '%');
        }
    });

    return TimeProgressAreaView;
});