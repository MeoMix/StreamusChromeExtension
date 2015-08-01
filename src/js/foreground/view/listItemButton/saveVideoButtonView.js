define(function(require) {
  'use strict';

  var ListItemButton = require('foreground/view/behavior/listItemButton');
  var VideoActions = require('foreground/model/video/videoActions');
  var SaveListItemButtonTemplate = require('text!template/listItemButton/saveListItemButton.html');
  var SaveIconTemplate = require('text!template/icon/saveIcon_18.svg');

  var SaveVideoButtonView = Marionette.LayoutView.extend({
    template: _.template(SaveListItemButtonTemplate),
    templateHelpers: {
      saveIcon: _.template(SaveIconTemplate)()
    },

    behaviors: {
      ListItemButton: {
        behaviorClass: ListItemButton
      }
    },

    signInManager: null,
    video: null,

    initialize: function(options) {
      this.video = options.video;
      this.signInManager = options.signInManager;
      this.listenTo(this.signInManager, 'change:signedInUser', this._onSignInManagerChangeSignedInUser);
    },

    onRender: function() {
      this._setState();
    },

    onClick: function() {
      var videoActions = new VideoActions();
      var offset = this.$el.offset();
      var playlists = this.signInManager.get('signedInUser').get('playlists');

      videoActions.showSaveMenu(this.video, offset.top, offset.left, playlists);
    },

    _onSignInManagerChangeSignedInUser: function() {
      this._setState();
    },

    _setState: function() {
      var signedIn = this.signInManager.has('signedInUser');

      var tooltipText = signedIn ? chrome.i18n.getMessage('save') : chrome.i18n.getMessage('notSignedIn');
      this.$el.attr('data-tooltip-text', tooltipText).toggleClass('is-disabled', !signedIn);
      this.model.set('enabled', signedIn);
    }
  });

  return SaveVideoButtonView;
});