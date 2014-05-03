define([
    'foreground/view/behavior/multiSelect',
    'foreground/view/behavior/sortable',
    'foreground/view/behavior/tooltipOnFullyVisible'
], function(MultiSelect, Sortable, TooltipOnFullyVisible) {
    'use strict';

    var behaviors = {
        MultiSelect: MultiSelect,
        Sortable: Sortable,
        TooltipOnFullyVisible: TooltipOnFullyVisible
    };

    return behaviors;
})