define(function () {
    'use strict';

    var LazyLoader = Backbone.Model.extend({

        defaults: function () {
            return {
                containerDictionary: [],
                //  TODO: Apply at a per-item level and not on a lazyloader level.
                settings: {
                    threshold: 250
                }
            };
        },
        
        //  If the given element is already visible -- just show it. Otherwise, subscribe.
        showOrSubscribe: function (container, elements) {
            this.showErrorIfContainerUnready(container);

            elements = this.enforceArrayType(elements);
            //  Only iterate over valid jQuery selectors.
            elements = this.rejectZeroLength(elements);

            var threshold = this.get('settings').threshold;

            //  Sort all given elements into two piles. Visible elements and invisible elements.
            var visibleElements = [];
            var hiddenElements = [];
            
            _.each(elements, function (element) {
                var elementIsInContainer = this.isElementInContainer(container, element, threshold);
                
                if (elementIsInContainer) {
                    visibleElements.push(element);
                } else {
                    hiddenElements.push(element);
                }
            }.bind(this));
            
            //  Attempt to show visible elements if they aren't already loaded
            this.showElements(visibleElements);
            this.subscribe(container, hiddenElements);
        },
        
        getVisibleElements: function (container) {
            var existingContainer = _.findWhere(this.get('containerDictionary'), { container: container });

            var threshold = this.get('settings').threshold;
            var visibleElements = _.filter(existingContainer.elements, function (element) {
                return this.isElementInContainer(container, element, threshold);
            }.bind(this));

            return visibleElements;
        },
        
        //  Prompt that something has gone wrong if the container isn't loaded yet.
        //  Most commonly happens when trying to bind to an item that is transitioning in.
        showErrorIfContainerUnready: function(container) {
            if (_.isUndefined(container.offset()) || container.height() === 0) {
                console.error('Container isn\'t fully loaded yet!');
            }
        },
        
        showElements: function(elements) {
            _.each(elements, function (element) {
                
                if (_.isUndefined(element.data('original')) || element.data('original') === '') {
                    console.error("Element doesn't have an original property -- can't lazy load it");
                }
                else if (element.attr('src') !== element.data('original')) {
                    element.attr('src', element.data('original'));
                } else {
                    console.error("Element already has src loaded:", element);
                }
                
            });
        },
        
        //  Convert a singular element into an array for to enforce proper types.
        //  It's just nice to not have to worry about whether something is an array or a singular.
        enforceArrayType: function (elements) {
            if (!_.isArray(elements)) {
                elements = [elements];
            }

            return elements;
        },
        
        //  If the jQuery selector given for an element is no good - notify that element wasn't found.
        rejectZeroLength: function(elements) {
            return _.reject(elements, function (element) {
                var isZeroLength = element.length === 0;
                
                if (isZeroLength) {
                    console.error("Warning: Failed to find element:", element);
                }
                
                return isZeroLength;
            });
        },

        subscribe: function (container, elements) {
            this.showErrorIfContainerUnready(container);
            
            elements = this.enforceArrayType(elements);
            //  Only iterate over valid jQuery selectors.
            elements = this.rejectZeroLength(elements);

            var containerDictionary = this.get('containerDictionary');
            
            //  Check to see if the given container is already subscribed to. If so, just merge the elements.
            var existingContainer = _.findWhere(containerDictionary, { container: container });

            if (existingContainer !== undefined) {
                //  Merge new elements together with existing elements.
                existingContainer.elements = _.union(existingContainer.elements, elements);

                console.log("Merged. Elements length:", existingContainer.elements.length);
            } else {
                //  Otherwise, just add the given container to the dictionary since it is new.
                containerDictionary.push({
                    container: container,
                    elements: elements
                });

                //  Call off because if multiple items have the same parent and want to be lazyloaded, no reason to bind multiple scroll events.
                container.off('scroll.lazyElements').on('scroll.lazyElements', function () {
                    
                    var visibleElements = this.getVisibleElements(container);
                    this.showElements(visibleElements);
                    
                    //  Stop tracking elements which have loaded.
                    this.unsubscribe(container, visibleElements);
                }.bind(this));
            }
        },
        
        unsubscribe: function (container, elements) {
            console.log("Unsubscribing");
            //  Convert a singular element into an array for to enforce proper types.
            elements = this.enforceArrayType(elements);
            
            var containerDictionary = this.get('containerDictionary');

            //  Check to see if the given container is already subscribed to. If not, there's nothing to unsubscribe.
            var existingContainer = _.findWhere(containerDictionary, { container: container });
            
            if (existingContainer !== undefined) {
                existingContainer.elements = _.reject(existingContainer.elements, function (element) {
                    //  Unsubscribe elements from container if they were passed into unsubscribe.
                    return _.contains(elements, element);
                });
            } else {
                console.error("No container found.");
            }
        },
        
        isElementInContainer: function (container, element, threshold) {

            var containerOffset = container.offset();
            var containerWidth = container.width();
            var containerHeight = container.height();
            var elementOffset = element.offset();
            var elementWidth = element.width();
            var elementHeight = element.height();

            var isRightOfContainer = this.isElementRightOfContainer(containerOffset, containerWidth, elementOffset, threshold);
            var isLeftOfContainer = this.isElementLeftOfContainer(containerOffset, elementOffset, elementWidth, threshold);
            var isBelowContainer = this.isElementBelowContainer(containerOffset, containerHeight, elementOffset, threshold);
            var isAboveContainer = this.isElementAboveContainer(containerOffset, elementOffset, elementHeight, threshold);

            return !isRightOfContainer && !isLeftOfContainer && !isBelowContainer && !isAboveContainer;
        },
        
        isElementRightOfContainer: function (containerOffset, containerWidth, elementOffset, threshold) {
            return containerOffset.left + containerWidth <= elementOffset.left - threshold;
        },

        isElementLeftOfContainer: function (containerOffset, elementOffset, elementWidth, threshold) {
            return containerOffset.left >= elementOffset.left + threshold + elementWidth;
        },
        
        isElementBelowContainer: function (containerOffset, containerHeight, elementOffset, threshold) {
            return containerOffset.top + containerHeight <= elementOffset.top - threshold;
        },

        isElementAboveContainer: function (containerOffset, elementOffset, elementHeight, threshold) {
            return containerOffset.top >= elementOffset.top + threshold + elementHeight;
        }
        
    });

    return new LazyLoader();
});