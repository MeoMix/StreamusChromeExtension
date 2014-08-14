define([
    'foreground/view/prompt/settingsPromptView',
    'text!template/menuArea.html'
], function (SettingsPromptView, MenuAreaTemplate) {
    'use strict';

    var MenuAreaView = Backbone.Marionette.ItemView.extend({
        id: 'menu-area',
        template: _.template(MenuAreaTemplate),
        
        templateHelpers: function () {
            return {
                settingsMessage: chrome.i18n.getMessage('settings'),
                keyboardShortcutsMessage: chrome.i18n.getMessage('keyboardShortcuts'),
                donateMessage: chrome.i18n.getMessage('donate'),
                reloadMessage: chrome.i18n.getMessage('reload')
            };
        },

        events: {
            'click @ui.menuButton': '_toggleMenu',
            'click @ui.settingsMenuItem': '_showSettingsPrompt',
            'click @ui.keyboardShortcutsMenuItem': '_openKeyboardShortcutsTab',
            'click @ui.donateMenuItem': '_openDonateTab',
            'click @ui.restartMenuItem': '_restart'
        },

        ui: {
            menuButton: '.menu-button',
            menu: '.menu',
            settingsMenuItem: '.menu .settings',
            donateMenuItem: '.menu .donate',
            keyboardShortcutsMenuItem: '.menu .keyboard-shortcuts',
            restartMenuItem: '.menu .restart'
        },

        menuShown: false,
        
        initialize: function () {
            this.listenTo(Backbone.Wreqr.radio.channel('global').vent, 'clickedElement', this._onClickedElement);
        },
        
        _onClickedElement: function (clickedElement) {
            if (clickedElement.closest(this.ui.menuButton.selector).length === 0) {
                this._hideMenu();
            }
        },

        _toggleMenu: function () {
            this.menuShown ? this._hideMenu() : this._showMenu();
        },
        
        _showMenu: function () {
            this.ui.menu.show();
            this.ui.menu.transition({
                opacity: 1
            }, 200, 'snap');

            this.ui.menuButton.addClass('enabled');
            this.menuShown = true;
        },
        
        _hideMenu: function () {
            this.ui.menu.transition({
                opacity: 0
            }, 200, 'snap', function() {
                this.ui.menu.hide();
            }.bind(this));
            
            this.ui.menuButton.removeClass('enabled');
            this.menuShown = false;
        },
        
        _showSettingsPrompt: function () {
            Backbone.Wreqr.radio.channel('prompt').vent.trigger('show', SettingsPromptView);
        },
        
        _openDonateTab: function () {
            chrome.tabs.create({
                url: 'https://streamus.com/#donate'
            });
        },
        
        _openKeyboardShortcutsTab: function() {
            chrome.tabs.create({
                url: 'chrome://extensions/configureCommands'
            });
        },
        
        _restart: function() {
            chrome.runtime.reload();
        }
    });

    return MenuAreaView;
});