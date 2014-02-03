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
        
        //  Iterate over each element in a container and see if it should be shown.
        update: function (container) {
            var settings = this.get('settings');
          
            var containerDictionary = this.get('containerDictionary');
            var existingContainer = _.findWhere(containerDictionary, { container: container });

            console.log("Container elements:", existingContainer.elements.length, existingContainer.container.attr('id'));

            var visibleElements = _.filter(existingContainer.elements, function (element) {
                return this.inviewport(container, element, settings.threshold);
            }.bind(this));

            this.showElements(visibleElements);

            //  Stop tracking elements which have loaded.
            this.unsubscribe(container, visibleElements);
        },
        
        showElements: function(elements) {
            _.each(elements, function (element) {
                element.attr('src', element.data('original'));
            });
        },
        
        //  If the given element is already visible -- just show it. Otherwise, subscribe.
        showOrSubscribe: function(container, elements) {
            if (container.offset() === undefined || container.height() === 0) {
                console.error('Container isn\'t fully loaded yet!');
            }

            //  Convert a singular element into an array for to enforce proper types.
            if (!_.isArray(elements)) {
                elements = [elements];
            }
            
            //  Only iterate over valid jQuery selectors.
            elements = this.rejectZeroLength(elements);

            var threshold = this.get('settings').threshold;

            var visibleElements = _.filter(elements, function (element) {
                return this.inviewport(container, element, threshold);
            }.bind(this));
            this.showElements(visibleElements);
            
            var hiddenElements = _.reject(elements, function(element) {
                return this.inviewport(container, element, threshold);
            }.bind(this));

            this.subscribe(container, hiddenElements);
        },
        
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
            
            if (container.offset() === undefined || container.height() === 0) {
                console.error('Container isn\'t fully loaded yet!');
            }

            //  Convert a singular element into an array for to enforce proper types.
            if (!_.isArray(elements)) {
                elements = [elements];
            }

            //  Only iterate over valid jQuery selectors.
            elements = this.rejectZeroLength(elements);

            var containerDictionary = this.get('containerDictionary');
            
            //  Check to see if the given container is already subscribed to. If so, just merge the elements.
            var existingContainer = _.findWhere(containerDictionary, { container: container });

            if (existingContainer !== undefined) {
                //  Merge new elements together with existing elements.
                existingContainer.elements = _.union(existingContainer.elements, elements);
            } else {
                //  Otherwise, just add the given container to the dictionary since it is new.
                containerDictionary.push({
                    container: container,
                    elements: elements
                });

                //  Call off because if multiple items have the same parent and want to be lazyloaded, no reason to bind multiple scroll events.
                //  TODO: I never unbind scroll event from my container, but I don't expect to support 100s of containers, only a few.
                container.off('scroll.lazyElements').on('scroll.lazyElements', function () {
                    this.update(container);
                }.bind(this));
            }
        },
        
        unsubscribe: function (container, elements) {
            console.log("Unsubscribing");
            //  Convert a singular element into an array for to enforce proper types.
            if (!_.isArray(elements)) {
                elements = [elements];
            }
            
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
        
        inviewport: function (container, element, threshold) {

            var rightoffold = this.rightoffold(container, element, threshold);
            var leftofbegin = this.leftofbegin(container, element, threshold);
            var belowthefold = this.belowthefold(container, element, threshold);
            var abovethetop = this.abovethetop(container, element, threshold);

            return !rightoffold && !leftofbegin && !belowthefold && !abovethetop;
        },
        
        belowthefold: function (container, element, threshold) {
            return container.offset().top + container.height() <= element.offset().top - threshold;
        },

        rightoffold: function (container, element, threshold) {
            return container.offset().left + container.width() <= element.offset().left - threshold;
        },

        abovethetop: function (container, element, threshold) {
            return container.offset().top >= element.offset().top + threshold + element.height();
        },

        leftofbegin: function (container, element, threshold) {
            return container.offset().left >= element.offset().left + threshold + element.width();
        }
        
    });

    return new LazyLoader();
});