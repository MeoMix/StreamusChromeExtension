//  Exposed globally so that Chrome Extension's foreground can access through chrome.extension.getBackgroundPage()
var Settings = null;

//  Denormalization point for the Background's selected models.
define(function () {
    'use strict';

    var settingsModel = Backbone.Model.extend({
        
        defaults: function() {
            return {
                localDebug: true,
                serverURL: '',
                activeFolderId: getItem('activeFolderId') || null,
                suggestedQuality: getItem('suggestedQuality') || 'default',
                userId: getItem('userId') || null,
				youTubeInjectClicked: getItem('youTubeInjectClicked') || true
            };
        },
        
        initialize: function () {
            //  BaseURL is needed for ajax requests to the server.
            if (this.get('localDebug')) {
                this.set('serverURL', 'http://localhost:61975/');
            }
            else {
                this.set('serverURL', 'http://streamus.apphb.com/');
            }

            this.on('change:activeFolderId', function (model, activeFolderId) {
                localStorage.setItem('activeFolderId', JSON.stringify(activeFolderId));
            });

            //  TODO: I think I need to finish implementing this?
            this.on('change:activePlaylistId', function (model, activePlaylistId) {
                localStorage.setItem('activePlaylistId', JSON.stringify(activePlaylistId));
            });
            
            this.on('change:suggestedQuality', function(model, suggestedQuality) {
                localStorage.setItem('suggestedQuality', suggestedQuality);
            });
            
            this.on('change:userId', function (model, userId) {
                localStorage.setItem('userId', JSON.stringify(userId));
            });

			this.on('change:youTubeInjectClicked', function (model, youTubeInjectClicked) {
                localStorage.setItem('youTubeInjectClicked', JSON.stringify(youTubeInjectClicked));
            });
        }
  
    });
    
    //  Fetch an item from localStorage, try and turn it from a string to an object literal if possible.
    //  If not, just allow the string type because its assumed to be correct.
    function getItem(key) {
        var item = localStorage.getItem(key);
        
        if (item !== null) {
            
            try {
                //  Make sure I don't send back 'null' or 'undefined' as string types.
                item = JSON.parse(item);
            } catch(exception) {
                //  Consume any exceptions because might try and parse a GUID which isn't valid JSON.
            }
        }

        return item;
    }
    
    //  TODO: Broke naming conventions here.
    Settings = new settingsModel();
    return Settings;
});