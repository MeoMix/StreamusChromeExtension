import _ from 'common/shim/lodash.reference.shim';
import {LayoutView} from 'marionette';
import ActivePanesRegion from 'foreground/view/activePane/activePanesRegion';
import AppBarRegion from 'foreground/view/appBar/appBarRegion';
import SimpleMenuRegion from 'foreground/view/simpleMenu/simpleMenuRegion';
import StreamControlBarRegion from 'foreground/view/streamControlBar/streamControlBarRegion';
import DialogRegion from 'foreground/view/dialog/dialogRegion';
import NotificationRegion from 'foreground/view/notification/notificationRegion';
import PlaylistsAreaRegion from 'foreground/view/playlist/playlistsAreaRegion';
import SearchRegion from 'foreground/view/search/searchRegion';
import SelectionBarRegion from 'foreground/view/selectionBar/selectionBarRegion';
import TooltipRegion from 'foreground/view/tooltip/tooltipRegion';
import KeyCode from 'foreground/enum/keyCode';
// TODO: Need pattern for registering Web Component.
import SliderView from 'foreground/view/element/sliderView';
import ForegroundAreaTemplate from 'template/foregroundArea.html!text';

var ForegroundAreaView = LayoutView.extend({
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
    this.listenTo(StreamusFG.channels.slider.vent, 'mouseDown', this._onSliderMouseDown);
    this.listenTo(StreamusFG.channels.slider.vent, 'mouseUp', this._onSliderMouseUp);

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
  },

  _onSliderMouseDown: function() {
    this.$el.addClass('is-clickingSlider');
  },

  _onSliderMouseUp: function() {
    this.$el.removeClass('is-clickingSlider');
  }
});

export default ForegroundAreaView;