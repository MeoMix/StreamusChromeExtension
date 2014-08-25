define([
    'foreground/view/prompt/settingsPromptView',
    'text!template/menuArea.html'
], function (SettingsPromptView, MenuAreaTemplate) {
    'use strict';
    
    var TabManager = Streamus.backgroundPage.TabManager;

    var MenuAreaView = Backbone.Marionette.ItemView.extend({
        id: 'menu-area',
        template: _.template(MenuAreaTemplate),
        
        templateHelpers: function () {
            return {
                settingsMessage: chrome.i18n.getMessage('settings'),
                keyboardShortcutsMessage: chrome.i18n.getMessage('keyboardShortcuts'),
                viewInTabMessage: chrome.i18n.getMessage('viewInTab'),
                donateMessage: chrome.i18n.getMessage('donate'),
                reloadMessage: chrome.i18n.getMessage('reload')
            };
        },

        events: {
            'click @ui.menuButton': '_toggleMenu',
            'click @ui.settingsMenuItem': '_showSettingsPrompt',
            'click @ui.keyboardShortcutsMenuItem': '_openKeyboardShortcutsTab',
            'click @ui.viewInTabMenuItem': '_openStreamusTab',
            'click @ui.donateMenuItem': '_openDonateTab',
            'click @ui.restartMenuItem': '_restart'
        },

        ui: {
            menuButton: '.menu-button',
            menu: '.menu',
            settingsMenuItem: '.menu .settings',
            viewInTabMenuItem: '.menu .view-in-tab',
            donateMenuItem: '.menu .donate',
            keyboardShortcutsMenuItem: '.menu .keyboard-shortcuts',
            restartMenuItem: '.menu .reload'
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
        
        _openStreamusTab: function () {
            TabManager.showStreamusTab();
        },
        
        _openDonateTab: function () {
            TabManager.showTab('https://streamus.com/#donate');
        },
        
        _openKeyboardShortcutsTab: function() {
            TabManager.showTab('chrome://extensions/configureCommands');
        },
        
        _restart: function() {
            chrome.runtime.reload();
        }
    });

    return MenuAreaView;
});