define(function(require) {
  'use strict';

  var ActivePanesRegion = require('foreground/view/activePane/activePanesRegion');
  var AppBarRegion = require('foreground/view/appBar/appBarRegion');
  var SimpleMenuRegion = require('foreground/view/simpleMenu/simpleMenuRegion');
  var StreamControlBarRegion = require('foreground/view/streamControlBar/streamControlBarRegion');
  var DialogRegion = require('foreground/view/dialog/dialogRegion');
  var NotificationRegion = require('foreground/view/notification/notificationRegion');
  var PlaylistsAreaRegion = require('foreground/view/playlist/playlistsAreaRegion');
  var SearchRegion = require('foreground/view/search/searchRegion');
  var SelectionBarRegion = require('foreground/view/selectionBar/selectionBarRegion');
  var TooltipRegion = require('foreground/view/tooltip/tooltipRegion');
  var KeyCode = require('foreground/enum/keyCode');
  var ForegroundAreaTemplate = require('text!template/foregroundArea.html');

  var ForegroundAreaView = Marionette.LayoutView.extend({
    el: '#foregroundArea',
    template: _.template(ForegroundAreaTemplate),

    events: {
      'mousedown': '_onMouseDown',
      'click': '_onClick',
      'contextmenu': '_onContextMenu'
    },

    regions: function() {
      return {
        spinner: 'spinner',
        appBar: {
          selector: 'appBar',
          regionClass: AppBarRegion
        },
        // TODO: This needs to come before activePane otherwise measurements are incorrect for scrollable behavior.
        streamControlBar: {
          selector: 'streamControlBar',
          regionClass: StreamControlBarRegion
        },
        dialog: {
          selector: 'dialog',
          regionClass: DialogRegion,
          player: StreamusFG.backgroundProperties.player,
          signInManager: StreamusFG.backgroundProperties.signInManager
        },
        notification: {
          selector: 'notification',
          regionClass: NotificationRegion
        },
        simpleMenu: {
          selector: 'simpleMenu',
          regionClass: SimpleMenuRegion
        },
        search: {
          selector: 'search',
          regionClass: SearchRegion,
          settings: StreamusFG.backgroundProperties.settings
        },
        playlistsArea: {
          selector: 'playlistsArea',
          regionClass: PlaylistsAreaRegion,
          signInManager: StreamusFG.backgroundProperties.signInManager
        },
        activePane: {
          selector: 'activePanes',
          regionClass: ActivePanesRegion
        },
        selectionBar: {
          selector: 'selectionBar',
          regionClass: SelectionBarRegion
        },
        tooltip: {
          selector: 'tooltip',
          regionClass: TooltipRegion
        }
      };
    },

    analyticsManager: null,

    initialize: function(options) {
      this.analyticsManager = options.analyticsManager;

      this.listenTo(StreamusFG.channels.scrollbar.vent, 'mouseDown', this._onScrollbarMouseDown);
      this.listenTo(StreamusFG.channels.scrollbar.vent, 'mouseUp', this._onScrollbarMouseUp);

      // It's important to bind pre-emptively or attempts to call removeEventListener will fail to find the appropriate reference.
      this._onWindowUnload = this._onWindowUnload.bind(this);
      // Provide a throttled version of _onWindowResize because resize events can fire at a high rate.
      // https://developer.mozilla.org/en-US/docs/Web/Events/resize
      this._onWindowResize = _.throttleFramerate(requestAnimationFrame, this._onWindowResize.bind(this));
      this._onWindowMouseMove = _.throttleFramerate(requestAnimationFrame, this._onWindowMouseMove.bind(this));
      this._onWindowError = this._onWindowError.bind(this);
      this._onKeyDown = this._onKeyDown.bind(this);

      window.addEventListener('unload', this._onWindowUnload);
      window.addEventListener('resize', this._onWindowResize);
      window.addEventListener('error', this._onWindowError);
      window.addEventListener('keydown', this._onKeyDown);
      window.addEventListener('mousemove', this._onWindowMouseMove);

      this.analyticsManager.sendPageView('/foreground.html');
    },

    onRender: function() {
      StreamusFG.channels.foregroundArea.vent.trigger('rendered');

      // After announcing that the foregroundArea has rendered successfully, wait a moment for other views to respond.
      // Then, announce that the foregroundArea is now an 'idle' state to allow for non-critical components to render themselves.
      setTimeout(function() {
        StreamusFG.channels.foregroundArea.vent.trigger('idle');
      }.bind(this), 250);
    },

    _onClick: function(event) {
      StreamusFG.channels.element.vent.trigger('click', event);
    },

    _onContextMenu: function(event) {
      StreamusFG.channels.element.vent.trigger('contextMenu', event);
    },

    _onMouseDown: function(event) {
      StreamusFG.channels.element.vent.trigger('mouseDown', event);

      //  Prevent using the middle-mouse button from scrolling the page because it doesn't respect overflow: hidden
      if (event.button === 1) {
        event.preventDefault();
      }
    },

    _onWindowResize: function() {
      StreamusFG.channels.window.vent.trigger('resize');
    },

    _onWindowMouseMove: function(event) {
      StreamusFG.channels.window.vent.trigger('mouseMove', event);
    },

    // Destroy the foreground to unbind event listeners from background models and collections.
    // Streamus will leak memory if these events aren't cleaned up.
    _onWindowUnload: function() {
      StreamusFG.backgroundChannels.foreground.vent.trigger('beginUnload');
      this.destroy();
      StreamusFG.backgroundChannels.foreground.vent.trigger('endUnload');
    },

    _onWindowError: function(event) {
      StreamusFG.backgroundChannels.error.vent.trigger('windowError', event);
    },

    _onKeyDown: function(event) {
      // If the user presses space without any child element focused then assume it's an intenentional request to play/pause.
      if (event.keyCode === KeyCode.Space && document.activeElement === document.body) {
        StreamusFG.channels.playPauseButton.commands.trigger('tryToggle:playerState');
      }
    },

    _onScrollbarMouseDown: function() {
      this.$el.addClass('is-clickingScrollbar');
    },

    _onScrollbarMouseUp: function() {
      this.$el.removeClass('is-clickingScrollbar');
    }
  });

  return ForegroundAreaView;
});