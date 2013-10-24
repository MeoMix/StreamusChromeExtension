define([
    'text!../template/saveSelectedPrompt.htm',
    'genericPromptView'
], function (SaveSelectedPromptTemplate, GenericPromptView) {
    'use strict';

    var SaveSelectedPromptView = GenericPromptView.extend({

        className: GenericPromptView.prototype.className + ' saveSelectedPrompt',

        template: _.template(SaveSelectedPromptTemplate),

        events: _.extend({}, GenericPromptView.prototype.events, {
            
        }),
        
        render: function () {

            GenericPromptView.prototype.render.call(this, {
            }, arguments);

            return this;
        },
        
        initialize: function () {
        },
        
        doOk: function () {

        }
        
    });

    return SaveSelectedPromptView;
});