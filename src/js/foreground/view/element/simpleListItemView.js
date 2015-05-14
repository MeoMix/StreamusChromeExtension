define(function(require) {
    'use strict';

    var SimpleMenuItems = require('foreground/collection/simpleMenuItems');
    var SimpleMenu = require('foreground/model/simpleMenu');
    var SimpleMenuView = require('foreground/view/element/simpleMenuView');
    var SimpleListItemTemplate = require('text!template/element/simpleListItem.html');

    var SimpleListItemView = Marionette.LayoutView.extend({
        className: 'simpleListItem listItem listItem--medium listItem--clickable',
        template: _.template(SimpleListItemTemplate),

        templateHelpers: function() {
            return {
                'data-tooltip-text': chrome.i18n.getMessage(this.model.get('labelKey'))
            };
        },

        regions: {
            simpleMenuRegion: '.simpleMenuRegion'
        },

        ui: {
            prettyValue: '.prettyValue'
        },

        events: {
            'click': '_onClick'
        },

        modelEvents: {
            'change:value': '_onChangeValue'
        },

        childEvents: {
            'click:simpleMenuItem': '_onClickSimpleMenuItem'
        },

        onRender: function() {
            this._setPrettyValue(this.model.get('value'));
        },

        _onClick: function() {
            this._openSimpleMenu();
        },

        _onChangeValue: function(model, value) {
            this._setPrettyValue(value);
        },

        _setPrettyValue: function(value) {
            this.ui.prettyValue.html(chrome.i18n.getMessage(value));
        },

        _openSimpleMenu: function() {
            //  If the list item is clicked while the menu is open do not re-open it.
            if (_.isUndefined(this.getChildView('simpleMenuRegion'))) {
                var options = this.model.get('options');
                var simpleMenuItems = new SimpleMenuItems(_.map(options, function(option) {
                    return {
                        active: this.model.get('value') === option,
                        text: chrome.i18n.getMessage(option),
                        value: option
                    };
                }, this));

                //  Since I'm building this inside of a click event and click events can close the menu I need to let the event finish before showing the menu
                //  otherwise it'll close immediately.
                _.defer(function() {
                    this.showChildView('simpleMenuRegion', new SimpleMenuView({
                        simpleMenuItems: simpleMenuItems,
                        model: new SimpleMenu(),
                        listItemHeight: this.$el.height()
                    }));
                }.bind(this));
            }
        },

        _onClickSimpleMenuItem: function(model, eventArgs) {
            var activeItem = eventArgs.collection.getActive();
            this.model.set('value', activeItem.get('value'));
        }
    });

    return SimpleListItemView;
});