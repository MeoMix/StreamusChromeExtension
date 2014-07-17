define([
    'backbone',
    'chai',
    'jquery.hoverIntent',
    'jquery',
    'jquery.qtip',
    'jquery.transit',
    'jquery-ui',
    'lodash',
    'mocha',
    'selectize',
    'sinon'
], function (Backbone, chai) {

    window.expect = chai.expect;
    window.mocha.setup('bdd');

    //  Finally, load the tests:
    require(['test/test'], function () {
        window.mocha.run();
    });
});