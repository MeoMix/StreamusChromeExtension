define([
    'foreground/view/prompt/settingsPromptView',
    'text!template/streamusMenuArea.html'
], function (SettingsPromptView, MenuAreaTemplate) {
    'use strict';
    
    var TabManager = Streamus.backgroundPage.TabManager;

    var StreamusMenuAreaView = Backbone.Marionette.ItemView.extend({
        className: 'streamus-menu-area',
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
            settingsMenuItem: '.settings',
            viewInTabMenuItem: '.view-in-tab',
            donateMenuItem: '.donate',
            keyboardShortcutsMenuItem: '.keyboard-shortcuts',
            restartMenuItem: '.reload'
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
            this.ui.menu.addClass('expanded');
            this.ui.menuButton.addClass('enabled');
            this.menuShown = true;
        },
        
        _hideMenu: function () {
            this.ui.menu.removeClass('expanded');
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

    return StreamusMenuAreaView;
});