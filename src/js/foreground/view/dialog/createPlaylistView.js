'use strict';
import {LayoutView} from 'marionette'
import DataSourceType from 'common/enum/dataSourceType';
import DialogContent from 'foreground/view/behavior/dialogContent';
import CreatePlaylistTemplate from 'template/dialog/createPlaylist.html!text';

var CreatePlaylistView = LayoutView.extend({
  id: 'createPlaylist',
  template: _.template(CreatePlaylistTemplate),
  titleMaxLength: 150,

  templateHelpers: function() {
    return {
      titleMessage: chrome.i18n.getMessage('title'),
      playlistUrlMessage: chrome.i18n.getMessage('playlistUrl'),
      titleMaxLength: this.titleMaxLength,
      // If the playlist is not already being created with videos then allow for importing of videos.
      showDataSource: this.videos.length === 0
    };
  },

  ui: {
    title: 'title',
    titleCharacterCount: 'title-characterCount',
    dataSource: 'dataSource',
    dataSourceHint: 'dataSource-hint'
  },

  events: {
    'input @ui.title': '_onInputTitle',
    'input @ui.dataSource': '_onInputDataSource'
  },

  behaviors: {
    DialogContent: {
      behaviorClass: DialogContent
    }
  },

  playlists: null,
  dataSourceManager: null,
  videos: [],

  initialize: function(options) {
    this.playlists = options.playlists;
    this.dataSourceManager = options.dataSourceManager;
    this.videos = _.isUndefined(options.videos) ? this.videos : options.videos;
  },

  onRender: function() {
    this._setDataSourceAsUserInput();
    this._setTitleCharacterCount();
    this._validateTitle();
  },

  onAttach: function() {
    // Reset the value after focusing to focus without selecting.
    this.ui.title.focus().val(this.ui.title.val());
  },

  onValidationFailed: function() {
    var titleValid = this.model.get('titleValid');

    if (!titleValid) {
      this.ui.title.focus();
    } else {
      this.ui.dataSource.focus();
    }
  },

  createPlaylist: function() {
    var trimmedTitle = this._getTrimmedTitle();

    if (this.videos.length > 0) {
      this.playlists.addPlaylistWithVideos(trimmedTitle, this.videos);
    } else {
      var dataSource = this.ui.dataSource.data('datasource');
      this.playlists.addPlaylistByDataSource(trimmedTitle, dataSource);
    }
  },

  _onInputDataSource: function() {
    this._debounceParseInput();
  },

  _onInputTitle: function() {
    this._setTitleCharacterCount();
    this._validateTitle();
  },

  _setTitleCharacterCount: function() {
    var trimmedTitle = this._getTrimmedTitle();
    this.ui.titleCharacterCount.text(trimmedTitle.length);
  },

  // Throttle for typing support so I don't continuously validate while typing
  _debounceParseInput: _.debounce(function() {
    // Wrap in a setTimeout to let drop event finish (no real noticeable lag but keeps things DRY easier)
    setTimeout(this._parseInput.bind(this));
  }, 100),

  _getTrimmedTitle: function() {
    return this.ui.title.val().trim();
  },

  _parseInput: function() {
    var youTubeUrl = this.ui.dataSource.val().trim();

    if (youTubeUrl !== '') {
      this._setDataSourceViaUrl(youTubeUrl);
    } else {
      this._resetInputState();
    }
  },

  _validateTitle: function() {
    // When the user submits - check to see if they provided a playlist name
    var title = this._getTrimmedTitle();
    var isInvalid = title.length === 0 || title.length > this.titleMaxLength;
    this.ui.title.toggleClass('is-invalid', isInvalid);
    this.model.set('titleValid', !isInvalid);
  },

  _setDataSourceAsUserInput: function() {
    var dataSource = this.dataSourceManager.getDataSource({
      type: DataSourceType.UserInput
    });

    this.ui.dataSource.data('datasource', dataSource);
  },

  _setDataSourceViaUrl: function(url) {
    // Check validity of URL and represent validity via invalid class.
    var dataSource = this.dataSourceManager.getDataSource({
      url: url,
      parseVideo: false
    });

    dataSource.parseUrl({
      success: this._onParseUrlSuccess.bind(this, dataSource),
      error: this._setErrorState.bind(this)
    });
  },

  _onParseUrlSuccess: function(dataSource) {
    if (!this.isDestroyed) {
      this.ui.dataSource.data('datasource', dataSource);

      dataSource.getTitle({
        success: this._onGetTitleSuccess.bind(this),
        error: this._setErrorState.bind(this)
      });
    }
  },

  _onGetTitleSuccess: function(title) {
    if (!this.isDestroyed) {
      this.ui.title.val(title);
      this._setTitleCharacterCount();
      this._validateTitle();
      this.ui.dataSource.removeClass('is-invalid').addClass('is-valid');
      this.ui.dataSourceHint.text(chrome.i18n.getMessage('playlistLoaded'));
      this.model.set('dataSourceValid', true);
    }
  },

  _setErrorState: function() {
    if (!this.isDestroyed) {
      this.ui.dataSourceHint.text(chrome.i18n.getMessage('errorLoadingUrl'));
      this.ui.dataSource.removeClass('is-valid').addClass('is-invalid');
      this.model.set('dataSourceValid', false);
    }
  },

  _resetInputState: function() {
    this.ui.dataSource.removeClass('is-invalid is-valid').removeData('datasource');
    this.ui.dataSourceHint.text('');
    this._setDataSourceAsUserInput();
    this.model.set('dataSourceValid', true);
  }
});

export default CreatePlaylistView;