define([
    'foreground/view/behavior/activeSlidingRender',
    'foreground/view/behavior/multiSelect',
    'foreground/view/behavior/slidingRender',
    'foreground/view/behavior/sortable',
    'foreground/view/behavior/tooltipOnFullyVisible'
], function(ActiveSlidingRender, MultiSelect, SlidingRender, Sortable, TooltipOnFullyVisible) {
    'use strict';

    var behaviors = {
        ActiveSlidingRender: ActiveSlidingRender,
        MultiSelect: MultiSelect,
        SlidingRender: SlidingRender,
        Sortable: Sortable,
        TooltipOnFullyVisible: TooltipOnFullyVisible
    };

    return behaviors;
})