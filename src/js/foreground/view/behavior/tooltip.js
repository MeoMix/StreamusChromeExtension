﻿//  This behavior decorates a view with a qTip2 Tooltip. It will apply a tooltip to the view's root element
//  if it has a title. It will also apply tooltips to child elements if they have the js-tooltipable or
//  js-textTooltipable class. The js-textTooltipable class assumes that the element's text is to be conditionally
//  shown as a tooltip. The text tooltip will only be shown if the text is overflows the element.
define(function() {
    'use strict';

    //  TODO: There might be a more elegant way to initialize these, but I definitely don't want to query for the window every time.
    $.extend($.fn.qtip.defaults.position, {
        viewport: $(window),
        my: 'top center',
        at: 'bottom center',
        adjust: $.extend($.fn.qtip.defaults.position.adjust, {
            y: 8,
            method: 'shift flipinvert'
        })
    });

    $.extend($.fn.qtip.defaults.show, {
        delay: 200
    });

    var Tooltip = Marionette.Behavior.extend({
        ui: {
            //  Children which need tooltips are decorated with the js-tooltipable class.
            tooltipable: '.js-tooltipable',
            //  Children which need tooltips, but also need to take into account overflowing, are decorated with the js-textTooltipable class.
            textTooltipable: '.js-textTooltipable'
        },

        isDecorated: false,

        events: {
            'mouseenter': '_onMouseEnter'
        },

        initialize: function() {
            //  Give Tooltip an array property of titleMutationObservers: https://github.com/jashkenas/backbone/issues/1442
            //  Mutation observers are used to track changes to js-textTooltipable elements. If the text
            //  is modified then its overflowing state needs to be re-evaluated. 
            _.extend(this, {
                titleMutationObservers: []
            });
        },

        onBeforeDestroy: function () {
            _.each(this.titleMutationObservers, function(titleMutationObserver) {
                titleMutationObserver.disconnect();
            });
            this.titleMutationObservers.length = 0;

            this._destroy(this.$el);
            this._destroy(this.ui.tooltipable);
            this._destroy(this.ui.textTooltipable);
        },

        _onMouseEnter: function() {
            //  Defer applying tooltips until absolutely necessary for rendering performance.
            if (!this.isDecorated) {
                this.isDecorated = true;
                //  Wrap in a RAF to allow for :hover effects to take place which might affect whether textTooltipable overflows or not.
                requestAnimationFrame(this._setTooltips.bind(this));
            }
        },

        _setTooltips: function() {
            //  Important to check since _setTooltips can be called through defer.
            if (!this.view.isDestroyed) {
                //  Decorate the view itself
                if (this._isTextTooltipableElement(this.$el)) {
                    this._decorateTextTooltipable(this.$el);
                } else if (this._isTooltipableElement(this.$el)) {
                    this._decorateTooltipable(this.$el);
                }

                //  Decorate child views
                if (this.ui.tooltipable.length > 0) {
                    _.each(this.ui.tooltipable, function(tooltipable) {
                        this._decorateTooltipable($(tooltipable));
                    }, this);
                }

                if (this.ui.textTooltipable.length > 0) {
                    _.each(this.ui.textTooltipable, function(textTooltipable) {
                        this._decorateTextTooltipable($(textTooltipable));
                    }, this);
                }

                // We only come here once, but since we are decorating the
                // element after it has been hovered over, we need to trigger
                // the 'mouseenter' again to get desired tooltip behavior.
                this.$el.trigger('mouseenter');
            }
        },

        _decorateTooltipable: function(tooltipableElement) {
            this._applyQtip(tooltipableElement);
            this._setTitleMutationObserver(tooltipableElement, false);
        },

        _decorateTextTooltipable: function(textTooltipableElement) {
            this._setTitleTooltip(textTooltipableElement, true);
            this._setTitleMutationObserver(textTooltipableElement, true);
        },
        
        //  Elements decorated with the class 'js-textTooltipable' should display a tooltip if their text is overflowing and truncated.
        _isTextTooltipableElement: function(element) {
            return element.hasClass('js-textTooltipable');
        },

        _isTooltipableElement: function(element) {
            return element.hasClass('js-tooltipable');
        },
        
        //  Whenever an element's title changes -- need to re-check to see if a title exists / if the element is overflowing and apply/remove the tooltip accordingly.
        _setTitleMutationObserver: function(element, checkOverflow) {
            var titleMutationObserver = new window.MutationObserver(function(mutations) {
                mutations.forEach(function(mutation) {
                    var oldTitle = mutation.attributeName === 'title' ? mutation.oldValue : undefined;
                    this._setTitleTooltip(element, checkOverflow, oldTitle);
                }.bind(this));
            }.bind(this));

            titleMutationObserver.observe(element[0], {
                attributes: true,
                //  Once qtip has been applied to the element -- oldtitle will mutate instead of title
                attributeFilter: ['title', 'oldtitle'],
                attributeOldValue: true,
                subtree: false
            });

            this.titleMutationObservers.push(titleMutationObserver);
        },

        _setTitleTooltip: function(element, checkOverflow, oldTitle) {
            if (checkOverflow) {
                //  Only show the tooltip if the title is overflowing.
                var textOverflows = element[0].offsetWidth < element[0].scrollWidth;

                if (textOverflows) {
                    this._applyQtip(element);
                } else {
                    //  It's important to only set the title to string.empty if it's not already string.empty because MutationObserver will infinite loop otherwise.
                    if (element.attr('title') !== '') {
                        //  Clear the title so that it doesn't show using the native tooltip.
                        element.attr('title', '');
                    }

                    //  If tooltip has already been applied to the element - remove it.
                    this._destroy(element);
                }
            } else {
                if (element.attr('title') === '') {
                    //  If there is no title on the given element, destroy its tooltip.
                    this._destroy(element);
                } else if (oldTitle === '') {
                    //  Only apply qtip if transitioning from no title previously because tooltip can change titles without needing to be re-applied.
                    this._applyQtip(element);
                }
            }
        },

        _applyQtip: function(element) {
            element.qtip();
        },
        
        //  Unbind qTip to allow the GC to clean-up everything.
        //  Memory leak will happen if this is not called.
        _destroy: function(element) {
            element.qtip('destroy', true);
        }
    });

    return Tooltip;
});