define([
    'foreground/view/prompt/settingsPromptView',
    'foreground/view/prompt/browserSettingsPromptView',
    'text!template/rightPane/adminMenuArea.html'
], function (SettingsPromptView, BrowserSettingsPromptView, AdminMenuAreaTemplate) {
    'use strict';
    
    var AdminMenuAreaView = Backbone.Marionette.ItemView.extend({
        id: 'adminMenuArea',
        template: _.template(AdminMenuAreaTemplate),
        
        templateHelpers: function () {
            return {
                settingsMessage: chrome.i18n.getMessage('settings'),
                browserSettingsMessage: chrome.i18n.getMessage('browserSettings'),
                keyboardShortcutsMessage: chrome.i18n.getMessage('keyboardShortcuts'),
                viewInTabMessage: chrome.i18n.getMessage('viewInTab'),
                donateMessage: chrome.i18n.getMessage('donate'),
                reloadMessage: chrome.i18n.getMessage('reload')
            };
        },

        events: {
            'click @ui.showMenuButton': '_toggleMenu',
            'click @ui.settingsMenuItem': '_showSettingsPrompt',
            'click @ui.browserSettingsMenuItem': '_showBrowserSettingsPrompt',
            'click @ui.keyboardShortcutsMenuItem': '_openKeyboardShortcutsTab',
            'click @ui.viewInTabMenuItem': '_openStreamusTab',
            'click @ui.donateMenuItem': '_openDonateTab',
            'click @ui.restartMenuItem': '_restart'
        },

        ui: {
            showMenuButton: '#adminMenuArea-showMenuButton',
            menu: '#adminMenuArea-menu',
            settingsMenuItem: '#adminMenuArea-settingsMenuItem',
            browserSettingsMenuItem: '#adminMenuArea-browserSettingsMenuItem',
            viewInTabMenuItem: '#adminMenuArea-viewInTabMenuItem',
            donateMenuItem: '#adminMenuArea-donateMenuItem',
            keyboardShortcutsMenuItem: '#adminMenuArea-keyboardShortcutsMenuItem',
            restartMenuItem: '#adminMenuArea-reloadMenuItem'
        },

        menuShown: false,
        //  TODO: Need a ViewModel to save state.
        tabManager: null,
        
        initialize: function () {
            this.tabManager = Streamus.backgroundPage.TabManager;

            this.listenTo(Streamus.channels.global.vent, 'clickedElement', this._onClickedElement);
        },
        
        _onClickedElement: function (clickedElement) {
            //  If the user clicks anywhere on the page except for this menu button -- hide the menu.
            if (clickedElement.closest(this.ui.showMenuButton.selector).length === 0) {
                this._hideMenu();
            }
        },

        _toggleMenu: function () {
            this.menuShown ? this._hideMenu() : this._showMenu();
        },
        
        _showMenu: function () {
            this.ui.menu.addClass('expanded');
            this.ui.showMenuButton.addClass('is-enabled');
            this.menuShown = true;
        },
        
        _hideMenu: function () {
            this.ui.menu.removeClass('expanded');
            this.ui.showMenuButton.removeClass('is-enabled');
            this.menuShown = false;
        },
        
        _showSettingsPrompt: function () {
            Streamus.channels.prompt.commands.trigger('show:prompt', SettingsPromptView);
        },
        
        _showBrowserSettingsPrompt: function () {
            Streamus.channels.prompt.commands.trigger('show:prompt', BrowserSettingsPromptView);
        },
        
        _openStreamusTab: function () {
            this.tabManager.showStreamusTab();
        },
        
        _openDonateTab: function () {
            this.tabManager.showDonateTab();
        },
        
        _openKeyboardShortcutsTab: function() {
            this.tabManager.showKeyboardShortcutsTab();
        },
        
        _restart: function() {
            chrome.runtime.reload();
        }
    });

    return AdminMenuAreaView;
});