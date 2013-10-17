require.config({
    
    baseUrl: '../js/',
    
    shim: {
        
        underscore: {
            exports: '_'
        },
        
        backbone: {
            //  These script dependencies should be loaded before loading backbone.js
            deps: ['underscore', 'jquery'],
            //  Once loaded, use the global 'Backbone' as the module value.
            exports: 'Backbone'
        },
        
        paths: {
            'fullscreen': 'fullscreen/fullscreen',
            'jquery': 'thirdParty/jquery',
            'backbone': 'thirdParty/backbone',
            'underscore': 'thirdParty/underscore',

            //  Enum:
            'playerState': 'enum/playerState',

            //  Collection:
            'streamItems': 'foreground/collection/streamItems',
            'contextMenuGroups': 'foreground/collection/contextMenuGroups',
            'contextMenuItems': 'foreground/collection/contextMenuItems',

            //  Model:
            'player': 'foreground/model/player',
            'contextMenu': 'foreground/model/contextMenu',
            'contextMenuGroup': 'foreground/model/contextMenuGroup',
            'contextMenuItem': 'foreground/model/contextMenuItem',

            //  View -> Video:
            'videoDisplayView': 'foreground/view/video/videoDisplayView',
            'contextMenuView': 'foreground/view/contextMenuView'
        }
        
    }
    
});

require([
    'jquery',
    'backbone',
    'underscore'
], function ($, Backbone, _) {
    'use strict';

    require(['fullscreen']);
});