define([
    'foreground/view/prompt/saveSongsPromptView',
    'test/testUtility'
], function (SaveSongsPromptView, TestUtility) {
    'use strict';

    describe('SaveSongsPromptView', function () {
        beforeEach(function () {
            this.documentFragment = document.createDocumentFragment();
        });
        
        it('should respond to model change:creating events', function () {
            sinon.stub(SaveSongsPromptView.prototype, '_onChangeCreating');
            
            this.view = new SaveSongsPromptView({
                songs: TestUtility.getSongArray(1)
            });

            this.view.contentView.model.trigger('change:creating', true);
            expect(this.view._onChangeCreating.calledOnce).to.equal(true);

            this.view._onChangeCreating.restore();
            
            this.view.destroy();
        });

        describe('with 1 song', function () {
            beforeEach(function() {
                this.view = new SaveSongsPromptView({
                    songs: TestUtility.getSongArray(1)
                });
            });
            
            afterEach(function () {
                this.view.destroy();
            });
            
            it('should show', function () {
                this.documentFragment.appendChild(this.view.render().el);
                this.view.triggerMethod('show');
            });

            describe('onSubmit', function() {
                it('should save songs', function () {
                    sinon.stub(this.view.contentView, 'saveSongs');

                    this.view.onSubmit();
                    expect(this.view.contentView.saveSongs.calledOnce).to.equal(true);
                    
                    this.view.contentView.saveSongs.restore();
                });
            });
        });

        describe('with >1 song', function() {
            beforeEach(function () {
                this.view = new SaveSongsPromptView({
                    songs: TestUtility.getSongArray(2)
                });
            });

            afterEach(function () {
                this.view.destroy();
            });
            
            it('should show', function () {
                this.documentFragment.appendChild(this.view.render().el);
                this.view.triggerMethod('show');
            });
        });
    });
});