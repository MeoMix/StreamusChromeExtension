define(function () {
    'use strict';

    var Tooltip = Backbone.Marionette.Behavior.extend({
        titleMutationObserver: null,
        //  Views which have transition effects for being made visible need to rely on an event past onShow.
        fullyVisible: false,

        ui: {
            //  Children which need tooltips are decorated with the tooltipable class.
            tooltipable: '.tooltipable',
            //  Children which need tooltips, but also need to take into account their text overflowing out of their container, are decorated with the text-tooltipable class.
            textTooltipable: '.text-tooltipable'
        },
        
        //  Call during onShow/onFullyVisible for tooltipable elements because they need to be able to inspect the DOM and see if the element is overflowing.
        onShow: function () {
            var isTextTooltipableElement = this._isTextTooltipableElement(this.$el);

            if (isTextTooltipableElement) {
                this._decorateTextTooltipableElement(this.$el);
            } else {
                this.$el.qtip();
            }

            this.ui.tooltipable.qtip();

            if (this.ui.textTooltipable.length > 0) {
                this._decorateTextTooltipableElement(this.ui.textTooltipable);
            }
        },
        
        onFullyVisible: function () {
            this.fullyVisible = true;

            //  TODO: Why does this not work without a setTimeout - I don't understand what would've changed if fullyVisible has already triggered.
            setTimeout(function() {
                this.ui.tooltipable.qtip();
            }.bind(this));
            
            this.view.children.each(function (childView) {
                //  TODO: I shouldn't be looking at title here like this. I should be looking directly at a text-tooltipable.
                var isTextTooltipableElement = this._isTextTooltipableElement(childView.ui.title);

                if (isTextTooltipableElement) {
                    this._decorateTextTooltipableElement(childView.ui.title);
                }
            }.bind(this));
        },

        onAfterItemAdded: function (childView) {
            if (this.fullyVisible) {
                //  TODO: Don't look at title class -- look at a text-tooltipable class.
                var isTextTooltipableElement = this._isTextTooltipableElement(childView.ui.title);

                if (isTextTooltipableElement) {
                    this._decorateTextTooltipableElement(childView.ui.title);
                }
            }
        },
        
        onClose: function () {
            if (this.titleMutationObserver !== null) {
                this.titleMutationObserver.disconnect();
            }
            
            this._destroy(this.$el);
        },
        
        _decorateTextTooltipableElement: function(textTooltipableElement) {
            this._setTitleTooltip(textTooltipableElement);
            this._setTitleMutationObserver(textTooltipableElement);
        },
        
        //  Elements decorated with the class 'text-tooltipable' should display a tooltip if their text is overflowing and truncated.
        _isTextTooltipableElement: function(element) {
            return element.hasClass('text-tooltipable');
        },
        
        //  Whenever an element's title changes -- need to re-check to see if it is overflowing and apply/remove the tooltip accordingly.
        _setTitleMutationObserver: function (element) {
            this.titleMutationObserver = new window.MutationObserver(function (mutations) {
                mutations.forEach(function (mutation) {
                    var attributeName = mutation.attributeName;
                    
                    //  Once qtip has been applied to the element -- oldtitle will mutate instead of title
                    if (attributeName === 'title' || attributeName === 'oldtitle') {
                        this._setTitleTooltip(element);
                    }
                }.bind(this));
            }.bind(this));
            
            //  TODO: Use this.el instead of de-referencing the jQuery object once Marionette supports it.
            this.titleMutationObserver.observe(element[0], {
                attributes: true,
                subtree: false
            });
        },
        
        _setTitleTooltip: function (element) {
            //  Only show the tooltip if the title is overflowing.
            var textOverflows = element[0].offsetWidth < element[0].scrollWidth;

            if (textOverflows) {
                element.qtip();
            } else {
                //  It's important to only set the title to string.empty if it's not already string.empty because MutationObserver will infinite loop otherwise.
                if (element.attr('title') !== '') {
                    //  Clear the title so that it doesn't show using the native tooltip.
                    element.attr('title', '');
                }

                //  TODO: is this necessary after updating qtip2?
                //  If tooltip has already been applied to the element - remove it.
                this._destroy(element);
            }
        },
        
        //  Unbind qTip to allow the GC to clean-up everything.
        //  Memory leak will happen if this is not called.
        _destroy: function (element) {
            element.qtip('destroy', true);
            //  TODO: This is throwing an error when playlistsArea closes??
            console.log('destroying', this.ui.tooltipable);
            this.ui.tooltipable.qtip('destroy', true);
        }
    });

    return Tooltip;
});