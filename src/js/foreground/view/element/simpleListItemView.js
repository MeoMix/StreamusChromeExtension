//  TODO: I'd like to figure out better naming conventions for this.
define([
    'foreground/collection/simpleMenuItems',
    'foreground/view/element/simpleMenuItemsView',
    'text!template/element/simpleListItem.html'
], function (SimpleMenuItems, SimpleMenuItemsView, SimpleListItemTemplate) {
    'use strict';

    var SimpleListItemView = Marionette.LayoutView.extend({
        //id: function () {
        //    return _.uniqueId('simpleListItem_');
        //},
        className: 'simpleListItem listItem listItem--medium is-clickable',
        template: _.template(SimpleListItemTemplate),
        
        templateHelpers: function () {
            return {
                title: chrome.i18n.getMessage(this.model.get('property')),
                viewId: 'simpleListItem'
            };
        },

        regions: function () {
            return {
                simpleMenuRegion: '#' + 'simpleListItem' + '-simpleMenuRegion'
            };
        },
        
        ui: function () {
            return {
                prettyValue: '#' + 'simpleListItem' + '-prettyValue'
            };
        },
        
        events: {
            'click': '_onClick'
        },
        
        modelEvents: {
            'change:value': '_onChangeValue'
        },
        
        initialize: function() {
            this.listenTo(Streamus.channels.element.vent, 'click', this._onElementClick);
        },
        
        onRender: function () {
            this._setPrettyValue(this.model.get('value'));
        },
        
        _onClick: function() {
            this._openSimpleMenu();
        },
        
        _onChangeValue: function (model, value) {
            this._setPrettyValue(value);
        },
        
        _setPrettyValue: function (value) {
            this.ui.prettyValue.html(chrome.i18n.getMessage(value));
        },
        
        _openSimpleMenu: function () {
            //  If the list item is clicked while the menu is open do not re-open it.
            if (_.isUndefined(this.simpleMenuRegion.currentView)) {
                var options = this.model.get('options');
                var simpleMenuItems = new SimpleMenuItems(_.map(options, function (option) {
                    return {
                        selected: this.model.get('value') === option,
                        text: chrome.i18n.getMessage(option),
                        value: option
                    };
                }, this));

                var simpleMenuItemsView = new SimpleMenuItemsView({
                    collection: simpleMenuItems,
                    listItemHeight: this.$el.height()
                });

                //  TODO: I don't think I am cleaning up my event handlers properly here, but I don't see an elegant way to do it.
                this.listenTo(simpleMenuItemsView, 'click:simpleMenuItem', this._onClickSimpleMenuItem);

                //  Since I'm building this inside of a click event and click events can close the prompt I need to let the event finish before showing the menu
                //  otherwise it'll close immediately.
                _.defer(function () {
                    this.simpleMenuRegion.show(simpleMenuItemsView);
                }.bind(this));
            }
        },
        
        _onClickSimpleMenuItem: function (eventArgs) {
            var selectedItem = eventArgs.collection.findWhere({ selected: true });
            this.model.set('value', selectedItem.get('value'));

            this.simpleMenuRegion.currentView.hide();
        },
        
        _onElementClick: function () {
            //  TODO: Maybe better to bind/unbind instead of checking for existence.
            if (!_.isUndefined(this.simpleMenuRegion.currentView)) {
                this.simpleMenuRegion.currentView.hide();
            }
        }
    });

    return SimpleListItemView;
});