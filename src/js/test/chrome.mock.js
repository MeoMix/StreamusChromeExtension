window.chrome = {
  alarms: {
    create: function() { },
    clear: function() { },
    onAlarm: {
      addListener: function() { },
      removeListener: function() { }
    }
  },
  app: {
    getDetails: function() {
      return {
        // jscs:disable requireCamelCaseOrUpperCaseIdentifiers
        homepage_url: 'https://streamus.com/',
        // jscs:enable requireCamelCaseOrUpperCaseIdentifiers
        version: '0.00'
      };
    }
  },
  browserAction: {
    onClicked: {
      addListener: function() { },
      removeListener: function() { }
    },
    setPopup: function() { },
    setTitle: function() { },
    setIcon: function() { }
  },
  commands: {
    onCommand: {
      addListener: function() { },
      removeListener: function() { }
    }
  },
  contextMenus: {
    create: function() { },
    update: function() { },
    remove: function() { }
  },
  extension: {
    getBackgroundPage: function() {
      return null;
    },
    getViews: function() { }
  },
  i18n: {
    getMessage: function() {
      return '';
    },
    getUILanguage: function() {
      return 'en';
    }
  },
  identity: {
    getProfileUserInfo: function() {
      return {
        id: '123',
        email: '123@abc.com'
      };
    },
    onSignInChanged: {
      addListener: function() { },
      removeListener: function() { }
    }
  },
  notifications: {
    create: function() { },
    clear: function() { }
  },
  omnibox: {
    setDefaultSuggestion: function() { },
    onInputChanged: {
      addListener: function() { },
      removeListener: function() { }
    },
    onInputEntered: {
      addListener: function() { },
      removeListener: function() { }
    }
  },
  permissions: {
    contains: function(permission, callback) {
      callback(false);
    },
    remove: function() { },
    request: function() { }
  },
  runtime: {
    id: 'jbnkffmindojffecdhbbmekbmkkfpmjd',
    onConnect: {
      addListener: function() { },
      removeListener: function() { }
    },
    onMessage: {
      addListener: function() { },
      removeListener: function() { }
    },
    onMessageExternal: {
      addListener: function() { },
      removeListener: function() { }
    },
    onUpdateAvailable: {
      addListener: function() { },
      removeListener: function() { }
    },
    getManifest: function() {
      return {
        version: ''
      };
    },
    getPlatformInfo: function() {
      return {
        os: '',
        arch: ''
      };
    },
    reload: function() {
    },
    connect: function() {
      return {
        onMessage: {
          addListener: _.noop,
          removeListener: _.noop
        },
        disconnect: _.noop,
        postMessage: _.noop
      };
    }
  },
  tabs: {
    create: function() { },
    sendMessage: function() { },
    query: function(queryInfo, response) {
      response();
    },
    highlight: function(highlightInfo, response) {
      response();
    }
  }
};