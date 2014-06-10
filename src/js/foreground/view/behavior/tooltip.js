//  This behavior decorates a view with a qTip2 Tooltip. It will apply a tooltip to the view's root element
//  if it has a title. It will also apply tooltips to child elements if they have the tooltipable or
//  text-tooltipale class. The text-tooltipable class assumes that the element's text is to be conditionally
//  shown as a tooltip. The text tooltip will only be shown if the text is overflows the element.
define(function () {
    'use strict';

    var Tooltip = Backbone.Marionette.Behavior.extend({
        //  Mutation observers are used to track changes to text-tooltipable elements. If the text
        //  is modified then its overflowing state needs to be re-evaluated. 
        titleMutationObservers: [],
        //  Views which have transition effects for being made visible need to rely on an event past onShow
        //  Otherwise, offsetWidth and scrollWidth will return incorrect values.
        fullyVisible: false,

        ui: {
            //  Children which need tooltips are decorated with the tooltipable class.
            tooltipable: '.tooltipable',
            //  Children which need tooltips, but also need to take into account overflowing, are decorated with the text-tooltipable class.
            textTooltipable: '.text-tooltipable'
        },
        
        onShow: function () {
            this._setTooltips();
        },
        
        onFullyVisible: function () {
            this.fullyVisible = true;
            this._setTooltips();

            if (this.view.children) {
                //  If children are already part of a collection which wasn't fully visible during onShow -- they need to be told to update tooltips.
                this.view.children.each(function (childView) {
                    childView.triggerMethod('AddedToFullyVisibleCollectionView');
                });
            }
        },
        
        onAfterItemAdded: function (childView) {
            if (this.fullyVisible) {
                //  Trigger the child because I do not want the parent responsible for decoration.
                //  It gets too hard to properly clean-up during onClose. So children implement the behavior and clean-up themselves.
                childView.triggerMethod('AddedToFullyVisibleCollectionView');
            }
        },

        //  Child-view event corresponding to onAfterItemAdded but only ran after the collection has been made fully visible
        //  i.e. transition effects have completed
        onAddedToFullyVisibleCollectionView: function () {
            this._setTooltips();
        },
        
        onClose: function () {
            _.each(this.titleMutationObservers, function (titleMutationObserver) {
                titleMutationObserver.disconnect();
            });
            this.titleMutationObservers.length = 0;

            this._destroy(this.$el);
            this._destroy(this.ui.tooltipable);
            this._destroy(this.ui.textTooltipable);
        },
        
        _setTooltips: function () {
            //  Decorate the view itself
            var isTextTooltipableElement = this._isTextTooltipableElement(this.$el);

            if (isTextTooltipableElement) {
                this._decorateTextTooltipable(this.$el);
            } else {
                this.$el.qtip();
            }

            //  Decorate child views
            this.ui.tooltipable.qtip();
            if (this.ui.textTooltipable.length > 0) {
                this._decorateTextTooltipable(this.ui.textTooltipable);
            }
        },
        
        _decorateTextTooltipable: function(textTooltipableElement) {
            this._setTitleTooltip(textTooltipableElement);
            this._setTitleMutationObserver(textTooltipableElement);
        },
        
        //  Elements decorated with the class 'text-tooltipable' should display a tooltip if their text is overflowing and truncated.
        _isTextTooltipableElement: function(element) {
            return element.hasClass('text-tooltipable');
        },
        
        //  Whenever an element's title changes -- need to re-check to see if it is overflowing and apply/remove the tooltip accordingly.
        _setTitleMutationObserver: function (element) {
            var titleMutationObserver = new window.MutationObserver(function (mutations) {
                mutations.forEach(function (mutation) {
                    var attributeName = mutation.attributeName;
                    
                    //  Once qtip has been applied to the element -- oldtitle will mutate instead of title
                    if (attributeName === 'title' || attributeName === 'oldtitle') {
                        this._setTitleTooltip(element);
                    }
                }.bind(this));
            }.bind(this));
            
            titleMutationObserver.observe(element[0], {
                attributes: true,
                subtree: false
            });

            this.titleMutationObservers.push(titleMutationObserver);
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
                
                //  If tooltip has already been applied to the element - remove it.
                this._destroy(element);
            }
        },
        
        //  Unbind qTip to allow the GC to clean-up everything.
        //  Memory leak will happen if this is not called.
        _destroy: function (element) {
            element.qtip('destroy', true);
        }
    });

    return Tooltip;
});