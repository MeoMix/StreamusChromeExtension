define([
    'foreground/view/behavior/multiSelect',
    'foreground/view/behavior/sortable'
], function(MultiSelect, Sortable) {
    'use strict';

    var behaviors = {
        Sortable: Sortable,
        MultiSelect: MultiSelect
    };

    return behaviors;
})