import {LayoutView} from 'marionette';
import SettingsDialogView from 'foreground/view/dialog/settingsDialogView';
import AboutStreamusDialogView from 'foreground/view/dialog/aboutStreamusDialogView';
import adminMenuAreaTemplate from 'template/appBar/adminMenuArea.hbs!';
import settingsIconTemplate from 'template/icon/settingsIcon_24.hbs!';

var AdminMenuAreaView = LayoutView.extend({
  id: 'adminMenuArea',
  template: adminMenuAreaTemplate,

  templateHelpers: {
    settingsIcon: settingsIconTemplate
  },

  ui: {
    menuButton: 'menuButton',
    menu: 'menu',
    settings: 'settings',
    openInTab: 'openInTab',
    keyboardShortcuts: 'keyboardShortcuts',
    aboutStreamus: 'aboutStreamus',
    restart: 'reload'
  },

  events: {
    'click @ui.menuButton': '_onClickMenuButton',
    'click @ui.settings': '_onClickSettings',
    'click @ui.keyboardShortcuts': '_onClickKeyboardShortcuts',
    'click @ui.openInTab': '_onClickOpenInTab',
    'click @ui.aboutStreamus': '_onClickAboutStreamus',
    'click @ui.restart': '_onClickRestart'
  },

  modelEvents: {
    'change:menuShown': '_onChangeMenuShown'
  },

  tabManager: null,

  elementEvents: {
    'drag': '_onElementDrag',
    'click': '_onElementClick'
  },

  initialize: function(options) {
    this.tabManager = options.tabManager;
    this.bindEntityEvents(StreamusFG.channels.element.vent, this.elementEvents);
  },

  _onClickMenuButton: function() {
    this.model.set('menuShown', !this.model.get('menuShown'));
  },

  _onClickSettings: function() {
    StreamusFG.channels.dialog.commands.trigger('show:dialog', SettingsDialogView);
  },

  _onClickKeyboardShortcuts: function() {
    this.tabManager.showKeyboardShortcutsTab();
  },

  _onClickOpenInTab: function() {
    this.tabManager.showStreamusTab();
  },

  _onClickAboutStreamus: function() {
    StreamusFG.channels.dialog.commands.trigger('show:dialog', AboutStreamusDialogView);
  },

  _onClickRestart: function() {
    chrome.runtime.reload();
  },

  _onElementDrag: function() {
    this.model.set('menuShown', false);
  },

  _onElementClick: function(event) {
    // If the user clicks anywhere on the page except for this menu button -- hide the menu.
    if ($(event.target).closest(this.ui.menuButton.selector).length === 0) {
      this.model.set('menuShown', false);
    }
  },

  _onChangeMenuShown: function(model, menuShown) {
    if (menuShown) {
      this._showMenu();
    } else {
      this._hideMenu();
    }
  },

  _showMenu: function() {
    this.ui.menu.addClass('is-visible');
  },

  _hideMenu: function() {
    this.ui.menu.removeClass('is-visible');
  }
});

export default AdminMenuAreaView;