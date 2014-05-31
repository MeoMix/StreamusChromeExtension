define([
    'foreground/view/behavior/multiSelect',
    'foreground/view/behavior/slidingRender',
    'foreground/view/behavior/sortable',
    'foreground/view/behavior/tooltip',
    'foreground/view/behavior/tooltipOnFullyVisible'
], function (MultiSelect, SlidingRender, Sortable, Tooltip, TooltipOnFullyVisible) {
    'use strict';

    var behaviors = {
        MultiSelect: MultiSelect,
        SlidingRender: SlidingRender,
        Sortable: Sortable,
        Tooltip: Tooltip,
        TooltipOnFullyVisible: TooltipOnFullyVisible
    };

    return behaviors;
});