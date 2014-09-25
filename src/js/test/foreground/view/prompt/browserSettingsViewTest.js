define([
    'foreground/view/prompt/browserSettingsView'
], function (BrowserSettingsView) {
    'use strict';

    describe('BrowserSettingsView', function () {
        beforeEach(function () {
            this.documentFragment = document.createDocumentFragment();
            this.view = new BrowserSettingsView({
                model: Streamus.backgroundPage.BrowserSettings
            });
        });

        afterEach(function () {
            this.view.destroy();
        });

        it('should show', function () {
            this.documentFragment.appendChild(this.view.render().el);
            this.view.triggerMethod('show');
        });
        
        it('should save model properties', function () {
            sinon.stub(this.view.model, 'save');

            this.view._saveProperty('property', 'value');
            expect(this.view.model.save.calledOnce).to.equal(true);

            this.view.model.save.restore();
        });
    });
})