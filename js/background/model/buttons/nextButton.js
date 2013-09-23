//  Exposed globally so that Chrome Extension's foreground can access through chrome.extension.getBackgroundPage()
var NextButton = null;

define([
    'streamItems',
    'settings',
    'repeatButtonState'
], function (StreamItems, Settings, RepeatButtonState) {
    'use strict';

    var nextButtonModel = Backbone.Model.extend({
        
        defaults: {
            enabled: false
        },
        
        initialize: function () {
            
            this.listenTo(StreamItems, 'add addMultiple remove empty change:selected', this.toggleEnabled);
            this.listenTo(Settings, 'change:radioEnabled change:shuffleEnabled change:repeatButtonState', this.toggleEnabled);

            this.toggleEnabled();
        },
        
        toggleEnabled: function () {

            var enabled = false;
            
            if (StreamItems.length > 0) {
                
                var radioEnabled = Settings.get('radioEnabled');
                var shuffleEnabled = Settings.get('shuffleEnabled');
                var repeatButtonState = Settings.get('repeatButtonState');

                //  You can skip with shuffle enabled if there are multiple items to shuffle between.
                if (shuffleEnabled && StreamItems.length > 1) {
                    enabled = true;
                }
                //  You can always continue if radio is enabled or if repeating is enabled
                else if (radioEnabled || repeatButtonState !== RepeatButtonState.DISABLED) {
                    enabled = true;
                } else {
                    //  Enable only if there are more items to skip to.
                    var selectedItemIndex = StreamItems.indexOf(StreamItems.findWhere({ selected: true }));

                    if (selectedItemIndex + 1 !== StreamItems.length) {
                        enabled = true;
                    }

                }

            }

            this.set('enabled', enabled);

        },
        
        //  Prevent spamming by only allowing a next click once every 100ms.
        trySelectNextVideo: _.debounce(function () {

            if (this.get('enabled')) {
                StreamItems.selectNext();
            }

            return this.get('enabled');

        }, 100, true)

    });

    NextButton = new nextButtonModel;

    return NextButton;
});