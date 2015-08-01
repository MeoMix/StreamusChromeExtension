define(function(require) {
  'use strict';

  var Videos = require('background/collection/videos');
  var OmniboxModifier = require('background/enum/omniboxModifier');
  var YouTubeV3API = require('background/model/youTubeV3API');
  var Utility = require('common/utility');

  // Displays streamus search suggestions and allows instant playing in the stream
  var ChromeOmniboxManager = Backbone.Model.extend({
    defaults: function() {
      return {
        suggestedVideos: new Videos(),
        searchRequest: null,
        modifiers: [],
        validModifiers: [OmniboxModifier.Add],
        streamItems: null
      };
    },

    initialize: function() {
      chrome.omnibox.setDefaultSuggestion({
        description: chrome.i18n.getMessage('pressEnterToPlay')
      });

      chrome.omnibox.onInputChanged.addListener(this._onChromeOmniboxInputChanged.bind(this));
      chrome.omnibox.onInputEntered.addListener(this._onChromeOmniboxInputEntered.bind(this));
    },

    _onChromeOmniboxInputChanged: function(text, suggest) {
      // Clear suggestedVideos
      this.get('suggestedVideos').reset();

      var searchText = text.trim();

      // Clear suggestions if there is no text.
      if (searchText === '') {
        this.set('modifiers', []);
        suggest([]);
      } else {
        // Do not display results if searchText was modified while searching, abort old request.
        var previousSearchRequest = this.get('searchRequest');

        if (!_.isNull(previousSearchRequest)) {
          previousSearchRequest.abort();
          this.set('searchRequest', null);
        }

        var modifiers = this._getModifiers(searchText);
        this.set('modifiers', modifiers);
        searchText = this._trimModifiers(searchText, modifiers);

        var searchRequest = YouTubeV3API.search({
          text: searchText,
          // Omnibox can only show 5 results
          maxResults: 5,
          success: this._onSearchResponse.bind(this, suggest, searchText)
        });

        this.set('searchRequest', searchRequest);
      }
    },

    _onChromeOmniboxInputEntered: function(text) {
      // Find the cached video data by url
      var pickedVideo = this.get('suggestedVideos').find(function(video) {
        return video.get('url') === text;
      });

      // If the user doesn't make a selection (commonly when typing and then just hitting enter on their query)
      // take the best suggestion related to their text.
      if (_.isUndefined(pickedVideo)) {
        pickedVideo = this.get('suggestedVideos').first();
      }

      var addOnlyModifierExists = _.contains(this.get('modifiers'), OmniboxModifier.Add);
      var playOnAdd = addOnlyModifierExists ? false : true;

      this.get('streamItems').addVideos(pickedVideo, {
        playOnAdd: playOnAdd
      });

      if (!playOnAdd) {
        StreamusBG.channels.backgroundNotification.commands.trigger('show:notification', {
          title: chrome.i18n.getMessage('videoAdded'),
          message: pickedVideo.get('title')
        });
      }
    },

    _getModifiers: function(text) {
      var validModifiers = this.get('validModifiers');
      var usedModifiers = [];

      _.each(validModifiers, function(modifier) {
        var indexOfModifier = text.indexOf('@' + modifier);

        if (indexOfModifier !== -1) {
          usedModifiers.push(modifier);
        }
      });

      return usedModifiers;
    },

    _trimModifiers: function(text, modifiers) {
      _.each(modifiers, function(modifier) {
        var regexp = new RegExp('@' + modifier, 'gi');
        text = text.replace(regexp, '');
      });

      return text.trim();
    },

    _onSearchResponse: function(suggest, searchText, searchResponse) {
      this.set('searchRequest', null);

      var suggestions = this._buildSuggestions(searchResponse.videos, searchText);
      suggest(suggestions);
    },

    _buildSuggestions: function(videos, text) {
      var suggestions = videos.map(function(video) {
        this.get('suggestedVideos').add(video);

        var safeTitle = _.escape(video.get('title'));
        var textStyleRegExp = new RegExp(Utility.escapeRegExp(text), 'i');
        var styledTitle = safeTitle.replace(textStyleRegExp, '<match>$&</match>');

        var description = '<dim>' + video.get('prettyDuration') + '</dim>  ' + styledTitle;

        return {
          content: video.get('url'),
          description: description
        };
      }, this);

      return suggestions;
    }
  });

  return ChromeOmniboxManager;
});