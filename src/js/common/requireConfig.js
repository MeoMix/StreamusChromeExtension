define({
    baseUrl: 'js/',
    enforceDefine: true,

    paths: {
        //  Paths:
        'template': '../template',

        //  Third Party:
        'backbone': 'thirdParty/backbone',
        'backbone.localStorage': 'thirdParty/backbone.localStorage',
        'backbone.marionette': 'thirdParty/backbone.marionette',
        'jquery': 'thirdParty/jquery',
        //  Rename lodash to underscore since functionally equivilant but underscore is expected by other third party libraries.
        'underscore': 'thirdParty/lodash',
        'text': 'thirdParty/text'
    }
});