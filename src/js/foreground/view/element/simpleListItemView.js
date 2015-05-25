define(function(require) {
    'use strict';

    var SimpleMenuItems = require('foreground/collection/simpleMenu/simpleMenuItems');
    var SimpleMenu = require('foreground/model/simpleMenu/simpleMenu');
    var SimpleMenuView = require('foreground/view/simpleMenu/simpleMenuView');
    var SimpleListItemTemplate = require('text!template/element/simpleListItem.html');

    var SimpleListItemView = Marionette.LayoutView.extend({
        className: 'simpleListItem listItem listItem--medium listItem--clickable',
        template: _.template(SimpleListItemTemplate),

        templateHelpers: function() {
            return {
                title: chrome.i18n.getMessage(this.model.get('labelKey'))
            };
        },

        regions: {
            simpleMenu: '[data-region=simpleMenu]'
        },

        ui: {
            prettyValue: '[data-ui~=prettyValue]'
        },

        events: {
            'click': '_onClick'
        },

        modelEvents: {
            'change:value': '_onChangeValue'
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
            // If the list item is clicked while the menu is open do not re-open it.
            if (_.isUndefined(this.getChildView('simpleMenu'))) {
                var options = this.model.get('options');
                var simpleMenuItems = new SimpleMenuItems(_.map(options, function(option) {
                    return {
                        active: this.model.get('value') === option,
                        text: chrome.i18n.getMessage(option),
                        value: option,
                        onClick: function(model) {
                            this.model.set('value', model.get('value'));
                        }.bind(this)
                    };
                }, this));

                this.showChildView('simpleMenu', new SimpleMenuView({
                    model: new SimpleMenu({
                        simpleMenuItems: simpleMenuItems,
                        listItemHeight: this.$el.height()
                    })
                }));
            }
        }
    });

    return SimpleListItemView;
});