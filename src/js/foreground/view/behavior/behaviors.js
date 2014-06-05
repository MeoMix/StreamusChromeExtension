define([
    'foreground/view/behavior/multiSelect',
    'foreground/view/behavior/slidingRender',
    'foreground/view/behavior/sortable',
    'foreground/view/behavior/tooltip'
], function (MultiSelect, SlidingRender, Sortable, Tooltip) {
    'use strict';

    var behaviors = {
        MultiSelect: MultiSelect,
        SlidingRender: SlidingRender,
        Sortable: Sortable,
        Tooltip: Tooltip
    };

    return behaviors;
});