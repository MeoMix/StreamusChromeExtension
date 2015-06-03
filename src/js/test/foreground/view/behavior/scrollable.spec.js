define(function(require) {
  'use strict';

  var Scrollable = require('foreground/view/behavior/scrollable');

  describe('Scrollable', function() {
    beforeEach(function() {
      this.documentFragment = document.createDocumentFragment();

      var ScrollableView = Marionette.CompositeView.extend({
        template: _.template('<div class="children"></div>'),
        behaviors: {
          Scrollable: {
            behaviorClass: Scrollable
          }
        },

        initialize: function() {
          this.$el.height(100);
        },

        onRender: function() {
          this.$el.find('.children').height(200);
        }
      });

      this.view = new ScrollableView();
      this.scrollable = this.view._behaviors[0];
    });

    afterEach(function() {
      this.view.destroy();
    });

    it('should be able to find all referenced ui targets', function() {
      this.documentFragment.appendChild(this.view.render().el);

      _.forIn(this.scrollable.ui, function(element) {
        if (element.length === 0) {
          console.error('Selector ' + element.selector + ' has length 0 on view', this.view.el);
        }

        expect(element.length).to.not.equal(0);
      }, this);
    });

    it('should setup properly after the view has been attached', function(done) {
      var element = this.view.render().el;
      document.body.appendChild(element);

      // Let the DOM acknowledge the new element.
      requestAnimationFrame(function() {
        this.view.triggerMethod('show');
        this.view.triggerMethod('attach');

        expect(this.scrollable.thumbHeight).not.to.equal(0);
        expect(this.scrollable.containerHeight).to.equal(this.scrollable.el.offsetHeight);
        expect(this.scrollable.containerHeight).not.to.equal(0);
        expect(this.scrollable.contentHeight).to.equal(this.scrollable.el.scrollHeight);
        expect(this.scrollable.contentHeight).not.to.equal(0);

        document.body.removeChild(element);
        done();
      }.bind(this));
    });

    it('should be able to append scrollbar elements to its view', function() {
      this.scrollable._appendScrollbarElements();
      expect(this.scrollable.ui.track.length).to.equal(1);
      expect(this.scrollable.ui.thumb.length).to.equal(1);
    });

    it('should know if the views content is not overflowing', function() {
      this.scrollable.contentHeight = 100;
      this.scrollable.containerHeight = 200;
      expect(this.scrollable._getIsOverflowing()).to.equal(false);
    });

    it('should know if the views content is overflowing', function() {
      this.scrollable.contentHeight = 200;
      this.scrollable.containerHeight = 100;
      expect(this.scrollable._getIsOverflowing()).to.equal(true);
    });

    describe('when calculating the thumb height', function() {
      it('should throw an error if given an invalid contentHeight', function() {
        sinon.spy(this.scrollable, '_getThumbHeight');
        try {
          this.scrollable._getThumbHeight(50, 0);
        } catch (e) {}
        expect(this.scrollable._getThumbHeight.threw()).to.equal(true);
        this.scrollable._getThumbHeight.restore();
      });

      it('should respect minThumbHeight', function() {
        this.scrollable.options.minThumbHeight = 30;
        var thumbHeight = this.scrollable._getThumbHeight(50, 100);
        expect(thumbHeight).to.equal(this.scrollable.options.minThumbHeight);
      });

      it('should derive minThumbHeight accurately', function() {
        var thumbHeight = this.scrollable._getThumbHeight(100, 100);
        expect(thumbHeight).to.equal(100);
      });
    });

    describe('when calling _getListScrollTop', function() {
      it('should do nothing if the view is not overflowing', function() {
        this.scrollable.contentHeight = 100;
        this.scrollable.containerHeight = 200;
        var listScrollTop = this.scrollable._getListScrollTop(30);
        expect(listScrollTop).to.equal(0);
      });

      it('should calculate listScrollTop if overflowing', function() {
        this.scrollable.contentHeight = 200;
        this.scrollable.containerHeight = 100;
        this.scrollable.thumbHeight = 40;
        var listScrollTop = this.scrollable._getListScrollTop(30);
        expect(listScrollTop).to.equal(50);
      });
    });

    describe('when calling _getContainerScrollTop', function() {
      it('should do nothing if the view is not overflowing', function() {
        this.scrollable.contentHeight = 100;
        this.scrollable.containerHeight = 200;
        var containerScrollTop = this.scrollable._getContainerScrollTop(100);
        expect(containerScrollTop).to.equal(0);
      });

      it('should calculate containerScrollTop if overflowing', function() {
        this.scrollable.contentHeight = 200;
        this.scrollable.containerHeight = 100;
        this.scrollable.thumbHeight = 40;
        var containerScrollTop = this.scrollable._getContainerScrollTop(100);
        expect(containerScrollTop).to.equal(60);
      });
    });

    it('should be able to respond to a containerScrollTop change', function() {
      sinon.stub(this.scrollable, '_updateScrollTop');

      this.scrollable.contentHeight = 200;
      this.scrollable.containerHeight = 100;

      var containerScrollTop = 50;
      this.scrollable._scrollContainer(containerScrollTop);
      var listScrollTop = this.scrollable._getListScrollTop(containerScrollTop);
      expect(this.scrollable._updateScrollTop.calledWith(listScrollTop, containerScrollTop)).to.equal(true);

      this.scrollable._updateScrollTop.restore();
    });

    it('should be able to respond to a listScrollTop change', function() {
      sinon.stub(this.scrollable, '_updateScrollTop');

      this.scrollable.contentHeight = 200;
      this.scrollable.containerHeight = 100;

      var listScrollTop = 50;
      this.scrollable._scrollList(listScrollTop);
      var containerScrollTop = this.scrollable._getContainerScrollTop(listScrollTop);
      expect(this.scrollable._updateScrollTop.calledWith(listScrollTop, containerScrollTop)).to.equal(true);

      this.scrollable._updateScrollTop.restore();
    });

    it('should be able to update scroll top', function() {
      this.view.render();

      var listScrollTop = 100;
      var containerScrollTop = 50;
      this.scrollable._updateScrollTop(100, 50);

      expect(this.scrollable.currentListScrollTop).to.equal(listScrollTop);
      expect(this.scrollable.currentContainerScrollTop).to.equal(containerScrollTop);
    });
  });
});