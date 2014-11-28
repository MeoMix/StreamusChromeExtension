define([
    'foreground/model/timeArea',
    'foreground/view/behavior/tooltip',
    'foreground/view/stream/timeAreaView',
    'text!template/stream/activeStreamItem.html'
], function (TimeArea, Tooltip, TimeAreaView, ActiveStreamItemTemplate) {
    'use strict';
    
    var ActiveStreamItemView = Marionette.LayoutView.extend({
        id: 'activeStreamItem',
        template: _.template(ActiveStreamItemTemplate),
        
        regions: function () {
            return {
                timeAreaRegion: '#' + this.id + '-timeAreaRegion'
            };
        },
        
        behaviors: {
            Tooltip: {
                behaviorClass: Tooltip
            }
        },

        onShow: function () {
            this.timeAreaRegion.show(new TimeAreaView({
                model: new TimeArea({
                    totalTime: this.model.get('song').get('duration')
                })
            }));
        }
    });

    return ActiveStreamItemView;
});