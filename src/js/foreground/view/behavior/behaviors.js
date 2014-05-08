define([
    'foreground/view/behavior/multiSelect',
    'foreground/view/behavior/slidingRender',
    'foreground/view/behavior/sortable',
    'foreground/view/behavior/tooltipOnFullyVisible'
], function (MultiSelect, SlidingRender, Sortable, TooltipOnFullyVisible) {
    'use strict';

    var behaviors = {
        MultiSelect: MultiSelect,
        SlidingRender: SlidingRender,
        Sortable: Sortable,
        TooltipOnFullyVisible: TooltipOnFullyVisible
    };

    return behaviors;
});