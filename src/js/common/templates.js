var _ = require('lodash');
exports["activePane_activePane"] = function(obj) {
obj || (obj = {});
var __t, __p = '', __e = _.escape;
with (obj) {
__p += '<div data-region=\'content\' class=\'flexColumn\'></div>';

}
return __p
};
exports["activePane_activePanes"] = function(obj) {
obj || (obj = {});
var __t, __p = '', __e = _.escape;
with (obj) {
__p += '<div data-region=\'stream\' data-ui=\'streamRegion\' class=\'flexColumn\'></div>\r\n<div data-region=\'activePlaylistArea\' data-ui=\'activePlaylistAreaRegion\' class=\'flexColumn\'></div>';

}
return __p
};
exports["appBar_activePaneFilter"] = function(obj) {
obj || (obj = {});
var __t, __p = '', __e = _.escape;
with (obj) {
__p += '<div data-ui=\'title\' class=\'activePaneFilter-content u-textOverflowEllipsis\'>\r\n  ' +
((__t = ( title )) == null ? '' : __t) +
'\r\n</div>\r\n<div data-ui=\'filterIcon\' class=\'activePaneFilter-filterIcon\'></div>';

}
return __p
};
exports["appBar_adminMenuArea"] = function(obj) {
obj || (obj = {});
var __t, __p = '', __e = _.escape;
with (obj) {
__p += '<div data-ui=\'menuButton\' class=\'button button--icon button--icon--primary button--large\'>\r\n  <span>\r\n    ' +
((__t = ( settingsIcon )) == null ? '' : __t) +
'\r\n  </span>\r\n</div>\r\n\r\n<div data-ui=\'menu\' class=\'adminMenuArea-menu panel panel--detached appBar-panel\'>\r\n  <ul class=\'menu-items panel-content panel-content--fadeInOut panel-content--uncolored\'>\r\n    <li data-ui=\'settings\' class=\'listItem listItem--small listItem--clickable\'>\r\n      <div class=\'listItem-content\'>\r\n        <div class=\'listItem-title\'>\r\n          ' +
((__t = ( settingsMessage )) == null ? '' : __t) +
'\r\n        </div>\r\n      </div>\r\n    </li>\r\n    <li data-ui=\'keyboardShortcuts\' class=\'listItem listItem--small listItem--clickable\'>\r\n      <div class=\'listItem-content\'>\r\n        <div class=\'listItem-title\'>\r\n          ' +
((__t = ( keyboardShortcutsMessage )) == null ? '' : __t) +
'\r\n        </div>\r\n      </div>\r\n    </li>\r\n    <li data-ui=\'openInTab\' class=\'listItem listItem--small listItem--clickable\'>\r\n      <div class=\'listItem-content\'>\r\n        <div class=\'listItem-title\'>\r\n          ' +
((__t = ( openInTabMessage )) == null ? '' : __t) +
'\r\n        </div>\r\n      </div>\r\n    </li>\r\n    <li data-ui=\'aboutStreamus\' class=\'listItem listItem--small listItem--clickable\'>\r\n      <div class=\'listItem-content\'>\r\n        <div class=\'listItem-title\'>\r\n          ' +
((__t = ( aboutStreamusMessage )) == null ? '' : __t) +
'\r\n        </div>\r\n      </div>\r\n    </li>\r\n    <li data-ui=\'reload\' class=\'listItem listItem--small listItem--clickable\'>\r\n      <div class=\'listItem-content\'>\r\n        <div class=\'listItem-title\'>\r\n          ' +
((__t = ( reloadMessage )) == null ? '' : __t) +
'\r\n        </div>\r\n      </div>\r\n    </li>\r\n  </ul>\r\n</div>\r\n';

}
return __p
};
exports["appBar_appBar"] = function(obj) {
obj || (obj = {});
var __t, __p = '', __e = _.escape;
with (obj) {
__p += '<div class=\'contentBar contentBar--top contentBar--elevated\'>\r\n  <div data-ui=\'showPlaylistsAreaButton tooltipable\' class=\'contentBar-navButton button button--icon button--icon--primary button--large\'>\r\n    ' +
((__t = ( menuIcon )) == null ? '' : __t) +
'\r\n  </div>\r\n\r\n  <div data-ui=\'hidePlaylistsAreaButton\' class=\'contentBar-navButton button button--icon button--icon--primary button--large is-hidden\'>\r\n    ' +
((__t = ( menuIcon )) == null ? '' : __t) +
'\r\n  </div>\r\n\r\n  <div data-region=\'activePaneFilter\' class=\'flexRow\'></div>\r\n  <div data-region=\'searchInputArea\' class=\'flexRow\'></div>\r\n\r\n  <div data-region=\'adminMenuArea\'></div>\r\n</div>';

}
return __p
};
exports["appBar_playlistTitle"] = function(obj) {
obj || (obj = {});
var __t, __p = '', __e = _.escape;
with (obj) {
__p +=
((__t = ( title )) == null ? '' : __t);

}
return __p
};
exports["appBar_searchInputArea"] = function(obj) {
obj || (obj = {});
var __t, __p = '', __e = _.escape;
with (obj) {
__p += '<div data-ui=\'searchInputWrapper\' class=\'searchInputArea-searchInputWrapper flexRow is-active\'>\r\n  <div class=\'searchInputArea-searchIcon button button--icon\'>\r\n    ' +
((__t = ( searchIcon )) == null ? '' : __t) +
'\r\n  </div>\r\n\r\n  <input data-ui=\'searchInput\' class=\'searchInputArea-searchInput\' type=\'text\' placeholder=\'' +
((__t = ( searchMessage )) == null ? '' : __t) +
'\' value=\'' +
((__t = ( searchQuery )) == null ? '' : __t) +
'\'>\r\n\r\n  <div data-ui=\'clearSearchIcon\' class=\'searchInputArea-clearSearchIcon button button--icon is-hidden\'>\r\n    ' +
((__t = ( clearSearchIcon )) == null ? '' : __t) +
'\r\n  </div>\r\n</div>\r\n\r\n<div data-ui=\'searchButton\' class=\'searchInputArea-searchIcon button button--icon button--icon--primary button--large is-hidden\'>\r\n  ' +
((__t = ( searchIcon )) == null ? '' : __t) +
'\r\n</div>';

}
return __p
};
exports["backgroundArea"] = function(obj) {
obj || (obj = {});
var __t, __p = '', __e = _.escape;
with (obj) {
__p += '<div data-region=\'youTubePlayer\'></div>\r\n<div data-region=\'clipboard\'></div>';

}
return __p
};
exports["behavior_resizeEmitter"] = function(obj) {
obj || (obj = {});
var __t, __p = '', __e = _.escape;
with (obj) {
__p += '<div class=\'resizeEmitter\'>\r\n  <div data-ui=\'expand\'>\r\n    <div data-ui=\'expandChild\'></div>\r\n  </div>\r\n  <div data-ui=\'contract\' class=\'resizeEmitter-contract\'></div>\r\n</div>';

}
return __p
};
exports["contentScript_youTubePlayer_watermark"] = function(obj) {
obj || (obj = {});
var __t, __p = '', __e = _.escape;
with (obj) {
__p += '<a class=\'ytp-youtube-button ytp-button yt-uix-sessionlink\' tabindex=\'41\' target=\'_blank\' data-sessionlink=\'feature=player-button\' href=\'' +
((__t = ( videoUrl )) == null ? '' : __t) +
'\' title=\'Watch on www.youtube.com\'>\r\n  <svg xmlns:xlink=\'http://www.w3.org/1999/xlink\' height=\'100%\' version=\'1.1\' viewBox=\'0 0 51 36\' width=\'100%\'>\r\n    <defs>\r\n      <path d=\'M19.40,22.92 L19.40,22.08 C18.87,22.71 18.42,23.03 17.93,23.03 C17.50,23.03 17.20,22.82 17.05,22.44 C16.96,22.21 16.89,21.85 16.89,21.32 L16.89,15.23 L18.29,15.23 L18.29,21.47 C18.33,21.69 18.41,21.76 18.59,21.76 C18.86,21.76 19.10,21.52 19.40,21.09 L19.40,15.23 L20.80,15.23 L20.80,22.92 L19.40,22.92 Z M15.41,15.91 C15.04,15.39 14.45,15.17 13.86,15.17 C13.19,15.17 12.69,15.39 12.31,15.91 C12.02,16.30 11.87,16.93 11.87,17.75 L11.87,20.48 C11.87,21.30 12.01,21.86 12.29,22.25 C12.67,22.77 13.27,23.05 13.86,23.05 C14.45,23.05 15.07,22.77 15.44,22.25 C15.73,21.86 15.86,21.30 15.86,20.48 L15.86,17.74 C15.86,16.92 15.70,16.30 15.41,15.91 L15.41,15.91 Z M14.45,20.63 C14.53,21.40 14.30,21.77 13.86,21.77 C13.43,21.77 13.20,21.40 13.27,20.63 L13.27,17.59 C13.20,16.83 13.43,16.47 13.86,16.47 C14.30,16.47 14.53,16.83 14.45,17.59 L14.45,20.63 Z M10.32,22.92 L8.84,22.92 L8.84,18.73 C8.84,18.73 7.31,13.60 7,12.64 L8.55,12.64 L9.58,16.65 L10.61,12.64 L12.16,12.64 L10.32,18.73 L10.32,22.92 Z\' id=\'ytp-svg-24\'></path>\r\n      <path d=\'M42.90,11.22 C42.06,10.32 41.12,10.32 40.69,10.26 C37.60,10.03 32.97,10.03 32.97,10.03 C32.96,10.03 28.34,10.03 25.25,10.26 C24.82,10.32 23.88,10.32 23.04,11.22 C22.38,11.91 22.16,13.47 22.16,13.47 C22.16,13.47 21.94,15.30 21.94,17.13 L21.94,18.85 C21.94,20.68 22.16,22.51 22.16,22.51 C22.16,22.51 22.38,24.07 23.04,24.76 C23.88,25.66 24.98,25.63 25.47,25.73 C27.24,25.90 32.97,25.96 32.97,25.96 C32.97,25.96 37.60,25.95 40.69,25.72 C41.12,25.67 42.06,25.66 42.90,24.76 C43.56,24.07 43.77,22.51 43.77,22.51 C43.77,22.51 43.99,20.68 43.99,18.85 L43.99,17.13 C43.99,15.30 43.77,13.47 43.77,13.47 C43.77,13.47 43.56,11.91 42.90,11.22 L42.90,11.22 Z M25.31,22.92 L25.31,14.16 L23.76,14.16 L23.76,12.72 L28.41,12.71 L28.41,14.16 L26.79,14.16 L26.79,22.92 L25.31,22.92 Z M30.70,22.92 L30.70,22.08 C30.17,22.71 29.72,23.03 29.23,23.03 C28.79,23.03 28.50,22.82 28.35,22.44 C28.25,22.21 28.19,21.85 28.19,21.32 L28.19,15.30 L29.59,15.30 L29.59,21.47 C29.63,21.69 29.71,21.76 29.89,21.76 C30.16,21.76 30.40,21.52 30.70,21.09 L30.70,15.30 L32.10,15.30 L32.10,22.92 L30.70,22.92 Z M37.05,22.16 C36.87,22.72 36.48,23.02 35.95,23.02 C35.48,23.02 34.95,22.72 34.50,22.15 L34.50,22.92 L32.98,22.92 L32.98,12.71 L34.50,12.71 L34.50,16.04 C34.93,15.49 35.46,15.18 35.95,15.18 C36.48,15.18 36.84,15.50 37.02,16.07 C37.11,16.37 37.20,16.87 37.20,17.59 L37.20,20.63 C37.20,21.34 37.14,21.83 37.05,22.16 L37.05,22.16 Z M40.73,21.21 C40.75,21.14 40.74,20.81 40.74,20.25 L42.15,20.25 L42.15,20.47 C42.15,20.91 42.11,21.23 42.10,21.37 C42.05,21.67 41.95,21.95 41.79,22.19 C41.42,22.74 40.87,23.02 40.17,23.02 C39.47,23.02 38.94,22.76 38.55,22.24 C38.27,21.86 38.09,21.29 38.09,20.48 L38.09,17.82 C38.09,17.00 38.25,16.37 38.54,15.99 C38.92,15.47 39.45,15.19 40.14,15.19 C40.81,15.19 41.34,15.47 41.71,15.99 C41.99,16.37 42.15,16.97 42.15,17.78 L42.15,19.34 L39.49,19.34 L39.49,20.71 C39.48,21.41 39.68,21.76 40.14,21.76 C40.47,21.76 40.66,21.58 40.73,21.21 L40.73,21.21 Z M40.12,16.45 C39.68,16.45 39.49,16.64 39.49,17.36 L39.49,18.20 L40.74,18.20 L40.74,17.37 C40.74,16.66 40.57,16.45 40.12,16.45 L40.12,16.45 Z M34.54,16.80 L34.54,21.42 C34.76,21.65 35.02,21.76 35.24,21.76 C35.62,21.76 35.80,21.47 35.80,20.71 L35.80,17.44 C35.80,16.67 35.62,16.45 35.24,16.45 C35.02,16.45 34.76,16.57 34.54,16.80 L34.54,16.80 Z\' id=\'ytp-svg-25\'></path>\r\n      <path d=\'M23,12 L43,12 L43,24 L23,24 Z\' id=\'ytp-svg-26\'></path>\r\n    </defs>\r\n    <use class=\'ytp-svg-shadow\' xlink:href=\'#ytp-svg-24\'></use>\r\n    <use class=\'ytp-svg-shadow\' xlink:href=\'#ytp-svg-25\'></use>\r\n    <use class=\'ytp-svg-fill\' xlink:href=\'#ytp-svg-24\'></use>\r\n    <use class=\'ytp-svg-fill ytp-svg-fill-logo-tube-text\' fill=\'none\' xlink:href=\'#ytp-svg-26\'></use>\r\n    <use class=\'ytp-svg-fill ytp-svg-fill-logo-tube-lozenge\' fill=\'#fff\' xlink:href=\'#ytp-svg-25\'></use>\r\n  </svg>\r\n</a>';

}
return __p
};
exports["dialog_aboutStreamus"] = function(obj) {
obj || (obj = {});
var __t, __p = '', __e = _.escape;
with (obj) {
__p += '<section class=\'grouping\'>\r\n  <div class=\'grouping-header\'>\r\n    ' +
((__t = ( applicationDetailsMessage )) == null ? '' : __t) +
'\r\n  </div>\r\n\r\n  <div class=\'grouping-content\'>\r\n    <ul>\r\n      <li data-ui=\'openHomepage\' class=\'grouping-item listItem listItem--small listItem--clickable\'>\r\n        ' +
((__t = ( openHomepageMessage )) == null ? '' : __t) +
'\r\n      </li>\r\n      <li data-ui=\'openPatchNotes\' class=\'grouping-item listItem listItem--small listItem--clickable\'>\r\n        ' +
((__t = ( openPatchNotesMessage )) == null ? '' : __t) +
'\r\n      </li>\r\n      <li class=\'grouping-item version\'>\r\n        <div class=\'simpleListItem listItem listItem--medium\'>\r\n          <div class=\'listItem-content\'>\r\n            <div class=\'listItem-title\'>\r\n              ' +
((__t = ( versionMessage )) == null ? '' : __t) +
'\r\n            </div>\r\n\r\n            <div class=\'listItem-details\'>\r\n              ' +
((__t = ( applicationDetails.version )) == null ? '' : __t) +
'\r\n            </div>\r\n          </div>\r\n        </div>\r\n      </li>\r\n    </ul>\r\n  </div>\r\n</section>';

}
return __p
};
exports["dialog_createPlaylist"] = function(obj) {
obj || (obj = {});
var __t, __p = '', __e = _.escape;
with (obj) {
__p += '<section class=\'grouping\'>\r\n  <input type=\'text\' data-ui=\'title submittable\' class=\'textInput textInput--basic\' placeholder=\'' +
((__t = ( titleMessage )) == null ? '' : __t) +
'\' maxlength=\'' +
((__t = ( titleMaxLength )) == null ? '' : __t) +
'\'>\r\n  <div class=\'textInput-hint textInput-characterCounter\'>\r\n    <span data-ui=\'title-characterCount\'>0</span> / ' +
((__t = ( titleMaxLength )) == null ? '' : __t) +
'\r\n  </div>\r\n</section>\r\n\r\n<section class=\'grouping ' +
((__t = ( showDataSource ? '' : 'is-hidden' )) == null ? '' : __t) +
'\'>\r\n  <input type=\'text\' data-ui=\'dataSource submittable\' class=\'textInput textInput--basic\' placeholder=\'' +
((__t = ( playlistUrlMessage )) == null ? '' : __t) +
'\'>\r\n  <div data-ui=\'dataSource-hint\' class=\'textInput-hint\'></div>\r\n</section>';

}
return __p
};
exports["dialog_deletePlaylist"] = function(obj) {
obj || (obj = {});
var __t, __p = '', __e = _.escape;
with (obj) {
__p +=
((__t = ( deleteMessage )) == null ? '' : __t) +
' ' +
((__t = ( title )) == null ? '' : __t) +
'?';

}
return __p
};
exports["dialog_dialog"] = function(obj) {
obj || (obj = {});
var __t, __p = '', __e = _.escape;
with (obj) {
__p += '<div data-ui=\'panel\' class=\'dialog-panel panel\'>\r\n  <div class=\'dialog-panel-content panel-content panel-content--uncolored\'>\r\n    <div data-region=\'content\' class=\'dialog-contentRegion\'></div>\r\n\r\n    <div class=\'dialog-contentBar--bottom contentBar contentBar--bottom flexColumn-bugFix\'>\r\n      <div data-region=\'reminder\' class=\'u-flex--full\'></div>\r\n\r\n      <div data-ui=\'cancelButton\' class=\'button button--flat ' +
((__t = ( showCancelButton ? '' : 'is-hidden' )) == null ? '' : __t) +
'\'>\r\n        ' +
((__t = ( cancelButtonText )) == null ? '' : __t) +
'\r\n      </div>\r\n\r\n      <div data-ui=\'submitButton submittable\' class=\'button button--flat\'>\r\n        ' +
((__t = ( submitButtonText )) == null ? '' : __t) +
'\r\n      </div>\r\n    </div>\r\n  </div>\r\n</div>';

}
return __p
};
exports["dialog_editPlaylist"] = function(obj) {
obj || (obj = {});
var __t, __p = '', __e = _.escape;
with (obj) {
__p += '<section class=\'grouping\'>\r\n  <input type=\'text\' data-ui=\'title submittable\' class=\'textInput textInput--basic\' placeholder=\'' +
((__t = ( titleMessage )) == null ? '' : __t) +
'\' value=\'' +
__e( playlist.get('title') ) +
'\'>\r\n  <div class=\'textInput-hint textInput-characterCounter\'>\r\n    <span data-ui=\'title-characterCount\'>0</span> / ' +
((__t = ( titleMaxLength )) == null ? '' : __t) +
'\r\n  </div>\r\n</section>';

}
return __p
};
exports["dialog_exportPlaylist"] = function(obj) {
obj || (obj = {});
var __t, __p = '', __e = _.escape;
with (obj) {
__p += '<section class=\'grouping\'>\r\n  <div class=\'grouping-header\'>' +
((__t = ( fileTypeMessage )) == null ? '' : __t) +
'</div>\r\n  <div class=\'grouping-content\'>\r\n    <ul>\r\n      <li>\r\n        <div data-region=\'fileType\'></div>\r\n      </li>\r\n    </ul>\r\n  </div>\r\n</section>';

}
return __p
};
exports["dialog_settings"] = function(obj) {
obj || (obj = {});
var __t, __p = '', __e = _.escape;
with (obj) {
__p += '<section class=\'grouping\'>\r\n  <div class=\'grouping-header\'>\r\n    ' +
((__t = ( generalMessage )) == null ? '' : __t) +
'\r\n  </div>\r\n\r\n  <div class=\'grouping-content\'>\r\n    <ul>\r\n      <li data-region=\'openInTab\' class=\'grouping-item listItem listItem--small listItem--clickable\'></li>\r\n      <li data-region=\'videoQuality\' class=\'grouping-item\'></li>\r\n      <li data-region=\'layoutType\' class=\'grouping-item\'></li>\r\n    </ul>\r\n  </div>\r\n</section>\r\n\r\n<section class=\'grouping\'>\r\n  <div class=\'grouping-header\'>\r\n    ' +
((__t = ( desktopNotificationsMessage )) == null ? '' : __t) +
'\r\n  </div>\r\n  <div class=\'grouping-content\'>\r\n    <ul>\r\n      <li data-region=\'desktopNotificationsEnabled\' class=\'grouping-item listItem listItem--small listItem--clickable\'></li>\r\n      <li data-region=\'desktopNotificationDuration\' class=\'grouping-item\'></li>\r\n    </ul>\r\n  </div>\r\n</section>\r\n\r\n<section class=\'grouping\'>\r\n  <div class=\'grouping-header\'>\r\n    ' +
((__t = ( remindersMessage )) == null ? '' : __t) +
'\r\n  </div>\r\n  <div class=\'grouping-content\'>\r\n    <ul>\r\n      <li data-region=\'remindClearStream\' class=\'grouping-item listItem listItem--small listItem--clickable\'></li>\r\n      <li data-region=\'remindDeletePlaylist\' class=\'grouping-item listItem listItem--small listItem--clickable\'></li>\r\n      <li data-region=\'remindLinkAccount\' class=\'grouping-item listItem listItem--small listItem--clickable\'></li>\r\n      <li data-region=\'remindGoogleSignIn\' class=\'grouping-item listItem listItem--small listItem--clickable\'></li>\r\n    </ul>\r\n  </div>\r\n</section>\r\n\r\n<section class=\'grouping\'>\r\n  <div class=\'grouping-header\'>\r\n    ' +
((__t = ( contextMenusMessage )) == null ? '' : __t) +
'\r\n  </div>\r\n\r\n  <div class=\'grouping-content\'>\r\n    <ul>\r\n      <li data-region=\'showTextSelectionContextMenu\' class=\'grouping-item listItem listItem--small\'></li>\r\n      <li data-region=\'showYouTubeLinkContextMenu\' class=\'grouping-item listItem listItem--small\'></li>\r\n      <li data-region=\'showYouTubePageContextMenu\' class=\'grouping-item listItem listItem--small\'></li>\r\n    </ul>\r\n  </div>\r\n</section>\r\n\r\n<section class=\'grouping\'>\r\n  <div class=\'grouping-header\'>\r\n    ' +
((__t = ( websiteEnhancementsMessage )) == null ? '' : __t) +
'\r\n  </div>\r\n\r\n  <div class=\'grouping-content\'>\r\n    <ul>\r\n      <li data-region=\'enhanceYouTube\' class=\'grouping-item listItem listItem--small listItem--clickable\'></li>\r\n      <li data-region=\'enhanceBeatport\' class=\'grouping-item listItem listItem--small listItem--clickable\'></li>\r\n    </ul>\r\n  </div>\r\n</section>\r\n';

}
return __p
};
exports["element_checkbox"] = function(obj) {
obj || (obj = {});
var __t, __p = '', __e = _.escape, __j = Array.prototype.join;
function print() { __p += __j.call(arguments, '') }
with (obj) {

 if (labelText === '') { ;
__p += '\r\n<span data-ui=\'icon\' class=\'checkbox-icon\'></span>\r\n';
 } else { ;
__p += '\r\n';
 if (iconOnLeft) { ;
__p += '\r\n<span data-ui=\'icon\' class=\'checkbox-icon\'></span>\r\n\r\n<label class=\'checkbox-label\'>\r\n  ' +
((__t = ( labelText )) == null ? '' : __t) +
'\r\n</label>\r\n';
 } else { ;
__p += '\r\n<label class=\'checkbox-label\'>\r\n  ' +
((__t = ( labelText )) == null ? '' : __t) +
'\r\n</label>\r\n\r\n<span data-ui=\'icon\' class=\'checkbox-icon\'></span>\r\n';
 } ;
__p += '\r\n';
 } ;


}
return __p
};
exports["element_radioButton"] = function(obj) {
obj || (obj = {});
var __t, __p = '', __e = _.escape;
with (obj) {
__p += '<div class=\'radio-container\'>\r\n  <div class=\'radio-state radio-off\'></div>\r\n  <div class=\'radio-state radio-on\'></div>\r\n</div>\r\n\r\n<div class=\'radio-label\'>\r\n  ' +
((__t = ( labelText )) == null ? '' : __t) +
'\r\n</div>';

}
return __p
};
exports["element_radioGroup"] = function(obj) {
obj || (obj = {});
var __t, __p = '', __e = _.escape;
with (obj) {
__p += '<div data-ui=\'buttons\'></div>';

}
return __p
};
exports["element_simpleListItem"] = function(obj) {
obj || (obj = {});
var __t, __p = '', __e = _.escape;
with (obj) {
__p += '<div data-region=\'simpleMenu\'></div>\r\n\r\n<div class=\'listItem-content\'>\r\n  <div class=\'listItem-title\'>\r\n    ' +
((__t = ( title )) == null ? '' : __t) +
'\r\n  </div>\r\n\r\n  <div data-ui=\'prettyValue\' class=\'listItem-details\'></div>\r\n</div>';

}
return __p
};
exports["element_slider"] = function(obj) {
obj || (obj = {});
var __t, __p = '', __e = _.escape;
with (obj) {
__p += '<div class=\'slider-trackContainer\'>\r\n  <div data-ui=\'track\' class=\'slider-track\'></div>\r\n</div>\r\n<div data-ui=\'thumb\' class=\'slider-thumb\'></div>';

}
return __p
};
exports["element_spinner"] = function(obj) {
obj || (obj = {});
var __t, __p = '', __e = _.escape;
with (obj) {
__p += '<div class=\'spinner-container\'>\r\n  <div class=\'spinner-layer spinner-layer--blue\'>\r\n    <div class=\'spinner-clipper spinner-clipper--left\'>\r\n      <div class=\'spinner-circle\'></div>\r\n    </div>\r\n    <div class=\'spinner--patch\'>\r\n      <div class=\'spinner-circle\'></div>\r\n    </div>\r\n    <div class=\'spinner-clipper spinner-clipper--right\'>\r\n      <div class=\'spinner-circle\'></div>\r\n    </div>\r\n  </div>\r\n\r\n  <div class=\'spinner-layer spinner-layer--red\'>\r\n    <div class=\'spinner-clipper spinner-clipper--left\'>\r\n      <div class=\'spinner-circle\'></div>\r\n    </div>\r\n    <div class=\'spinner--patch\'>\r\n      <div class=\'spinner-circle\'></div>\r\n    </div>\r\n    <div class=\'spinner-clipper spinner-clipper--right\'>\r\n      <div class=\'spinner-circle\'></div>\r\n    </div>\r\n  </div>\r\n\r\n  <div class=\'spinner-layer spinner-layer--yellow\'>\r\n    <div class=\'spinner-clipper spinner-clipper--left\'>\r\n      <div class=\'spinner-circle\'></div>\r\n    </div>\r\n    <div class=\'spinner--patch\'>\r\n      <div class=\'spinner-circle\'></div>\r\n    </div>\r\n    <div class=\'spinner-clipper spinner-clipper--right\'>\r\n      <div class=\'spinner-circle\'></div>\r\n    </div>\r\n  </div>\r\n\r\n  <div class=\'spinner-layer spinner-layer--green\'>\r\n    <div class=\'spinner-clipper spinner-clipper--left\'>\r\n      <div class=\'spinner-circle\'></div>\r\n    </div>\r\n    <div class=\'spinner--patch\'>\r\n      <div class=\'spinner-circle\'></div>\r\n    </div>\r\n    <div class=\'spinner-clipper spinner-clipper--right\'>\r\n      <div class=\'spinner-circle\'></div>\r\n    </div>\r\n  </div>\r\n</div>';

}
return __p
};
exports["element_switch"] = function(obj) {
obj || (obj = {});
var __t, __p = '', __e = _.escape;
with (obj) {
__p += '<label class=\'switch-label\'>\r\n  ' +
((__t = ( labelText )) == null ? '' : __t) +
'\r\n</label>\r\n\r\n<div data-ui=\'icon\' class=\'switch-icon\'></div>';

}
return __p
};
exports["foregroundArea"] = function(obj) {
obj || (obj = {});
var __t, __p = '', __e = _.escape;
with (obj) {
__p += '<div data-region=\'appBar\' class=\'u-elevated u-shadowed--low\'></div>\r\n<div data-region=\'search\' class=\'searchArea panel panel--top flexColumn u-fullHeight\'></div>\r\n<div data-region=\'streamControlBar\' class=\'flexColumn-bugFix u-zIndex--1\'></div>\r\n<div data-region=\'playlistsArea\' class=\'playlistsArea flexColumn overlay u-zIndex--3\'></div>\r\n<div class=\'flexRow u-relative\'>\r\n  <div data-region=\'activePanes\' class=\'flexColumn\'></div>\r\n</div>\r\n\r\n<div data-region=\'selectionBar\' class=\'panel panel--bottom u-fullWidth u-shadowed--low\'></div>\r\n<div data-region=\'dialog\' class=\'overlay u-elevated\'></div>\r\n<div data-region=\'notification\'></div>\r\n<div data-region=\'tooltip\' class=\'overlay u-zIndex--5\'></div>\r\n<div data-region=\'simpleMenu\' class=\'overlay u-zIndex--6\'></div>';

}
return __p
};
exports["leftPane_activePlaylistArea"] = function(obj) {
obj || (obj = {});
var __t, __p = '', __e = _.escape;
with (obj) {
__p += '<div class=\'instruction-wrapper\'>\r\n  <div data-ui=\'playlistEmptyMessage\' class=\'instruction\'>\r\n    <div class=\'instruction-header\'>\r\n      ' +
((__t = ( playlistEmptyMessage )) == null ? '' : __t) +
'\r\n    </div>\r\n    <div class=\'instruction-content\'>\r\n      ' +
((__t = ( wouldYouLikeToMessage )) == null ? '' : __t) +
' <span data-ui=\'showSearchLink\' class=\'u-link u-lowercase\'>' +
((__t = ( searchForVideosMessage )) == null ? '' : __t) +
'</span>?\r\n    </div>\r\n  </div>\r\n\r\n  <div data-region=\'playlistItems\' class=\'flexColumn\'></div>\r\n</div>\r\n\r\n<div class=\'contentBar contentBar--bottom u-bordered--top flexColumn-bugFix\'>\r\n  <div class=\'contentBar--bottom-text--left flexRow\'>\r\n    <div data-ui=\'playlistDetails textTooltipable\' class=\'u-lowercase u-textOverflowEllipsis text u-textSecondary\'></div>\r\n  </div>\r\n\r\n  <div data-ui=\'playAllButton\' class=\'button button--flat\'>\r\n    ' +
((__t = ( playAllMessage )) == null ? '' : __t) +
'\r\n  </div>\r\n\r\n  <div data-ui=\'addAllButton tooltipable\' class=\'button button--flat\'>\r\n    ' +
((__t = ( addAllMessage )) == null ? '' : __t) +
'\r\n  </div>\r\n</div>';

}
return __p
};
exports["leftPane_leftPane"] = function(obj) {
obj || (obj = {});
var __t, __p = '', __e = _.escape;
with (obj) {
__p += '<div data-region=\'content\' class=\'flexColumn\'></div>';

}
return __p
};
exports["leftPane_playlistItem"] = function(obj) {
obj || (obj = {});
var __t, __p = '', __e = _.escape;
with (obj) {
__p += '<div data-region=\'spinner\'></div>\r\n\r\n<div data-ui=\'leftContent\' class=\'listItem-leftContent is-showingThumbnail\'>\r\n  <div class=\'listItem-imageThumbnail spinner--faded--light\' style=\'background-image: url(\'https://img.youtube.com/vi/' +
((__t = ( video.get('id') )) == null ? '' : __t) +
'/mqdefault.jpg\')\' />\r\n  <div data-region=\'checkbox\' class=\'listItem-checkboxRegion\'></div>\r\n</div>\r\n\r\n<div class=\'listItem-content spinner--faded--light\'>\r\n  <div class=\'listItem-title\' data-ui=\'textTooltipable\' data-tooltip-text=\'' +
__e( video.get('title') ) +
'\'>\r\n    ' +
((__t = ( video.get('title') )) == null ? '' : __t) +
'\r\n  </div>\r\n\r\n  <div class=\'listItem-details\'>\r\n    ' +
((__t = ( video.get('prettyDuration') )) == null ? '' : __t) +
'\r\n  </div>\r\n</div>\r\n\r\n<span data-region=\'buttons\' class=\'listItem-buttonsRegion\'></span>';

}
return __p
};
exports["leftPane_playlistItems"] = function(obj) {
obj || (obj = {});
var __t, __p = '', __e = _.escape;
with (obj) {
__p += '<ol id=\'playlistItems-list\' data-ui=\'listItems\' class=\'js-droppable\'></ol>';

}
return __p
};
exports["leftPane_signIn"] = function(obj) {
obj || (obj = {});
var __t, __p = '', __e = _.escape;
with (obj) {
__p += '<div class=\'instruction-wrapper\'>\r\n  <div data-ui=\'signingInMessage\' class=\'instruction is-showingSpinner\'>\r\n    <div class=\'instruction-header\'>\r\n      ' +
((__t = ( signingInMessage )) == null ? '' : __t) +
'\r\n    </div>\r\n    <div data-region=\'spinner\'></div>\r\n  </div>\r\n\r\n  <div data-ui=\'signInMessage\' class=\'instruction\'>\r\n    <div data-ui=\'signInLink\' class=\'instruction-header u-link\'>\r\n      ' +
((__t = ( signInMessage )) == null ? '' : __t) +
'\r\n    </div>\r\n  </div>\r\n\r\n  <div data-ui=\'signInFailedMessage\' class=\'instruction\'>\r\n    <div class=\'instruction-header\'>\r\n      ' +
((__t = ( signInFailedMessage )) == null ? '' : __t) +
'\r\n    </div>\r\n    <div class=\'instruction-content\'>\r\n      ' +
((__t = ( pleaseWaitMessage )) == null ? '' : __t) +
' <span data-ui=\'signInRetryTimer\'>' +
((__t = ( signInRetryTimer )) == null ? '' : __t) +
'</span>\r\n    </div>\r\n  </div>\r\n</div>';

}
return __p
};
exports["listItemButton_addListItemButton"] = function(obj) {
obj || (obj = {});
var __t, __p = '', __e = _.escape;
with (obj) {
__p +=
((__t = ( addIcon )) == null ? '' : __t);

}
return __p
};
exports["listItemButton_deleteListItemButton"] = function(obj) {
obj || (obj = {});
var __t, __p = '', __e = _.escape;
with (obj) {
__p +=
((__t = ( deleteIcon )) == null ? '' : __t);

}
return __p
};
exports["listItemButton_optionsListItemButton"] = function(obj) {
obj || (obj = {});
var __t, __p = '', __e = _.escape;
with (obj) {
__p +=
((__t = ( optionsIcon )) == null ? '' : __t);

}
return __p
};
exports["listItemButton_playListItemButton"] = function(obj) {
obj || (obj = {});
var __t, __p = '', __e = _.escape;
with (obj) {
__p +=
((__t = ( playIcon )) == null ? '' : __t);

}
return __p
};
exports["listItemButton_playPauseVideoButton"] = function(obj) {
obj || (obj = {});
var __t, __p = '', __e = _.escape;
with (obj) {
__p += '<span data-ui=\'pauseIcon\'>\r\n  ' +
((__t = ( pauseIcon )) == null ? '' : __t) +
'\r\n</span>\r\n\r\n<span data-ui=\'playIcon\'>\r\n  ' +
((__t = ( playIcon )) == null ? '' : __t) +
'\r\n</span>';

}
return __p
};
exports["listItemButton_saveListItemButton"] = function(obj) {
obj || (obj = {});
var __t, __p = '', __e = _.escape;
with (obj) {
__p +=
((__t = ( saveIcon )) == null ? '' : __t);

}
return __p
};
exports["notification_notification"] = function(obj) {
obj || (obj = {});
var __t, __p = '', __e = _.escape;
with (obj) {
__p += '<div class=\'notification-content panel-content panel-content--fadeInOut u-textOverflowEllipsis\'>\r\n  ' +
((__t = ( message )) == null ? '' : __t) +
'\r\n</div>';

}
return __p
};
exports["playlist_playlist"] = function(obj) {
obj || (obj = {});
var __t, __p = '', __e = _.escape;
with (obj) {
__p += '<div data-region=\'spinner\'></div>\r\n\r\n<div class=\'listItem-content spinner--faded--light\'>\r\n  <div data-ui=\'title textTooltipable\' class=\'listItem-title u-flex--full\' data-tooltip-text=\'' +
__e( title ) +
'\'>\r\n    ' +
((__t = ( title )) == null ? '' : __t) +
'\r\n  </div>\r\n\r\n  <div data-ui=\'itemCount\' class=\'listItem-itemCount is-hiddenOnHover\'></div>\r\n</div>\r\n\r\n<span data-region=\'buttons\' class=\'listItem-buttonsRegion\'></span>';

}
return __p
};
exports["playlist_playlists"] = function(obj) {
obj || (obj = {});
var __t, __p = '', __e = _.escape;
with (obj) {
__p += '<ol id=\'playlists-list\' data-ui=\'listItems\'></ol>';

}
return __p
};
exports["playlist_playlistsArea"] = function(obj) {
obj || (obj = {});
var __t, __p = '', __e = _.escape;
with (obj) {
__p += '<div data-ui=\'overlay transitionable\' class=\'overlay overlay--faded\'></div>\r\n\r\n<div data-ui=\'panel transitionable\' class=\'navBar panel panel--left flexColumn flexColumn--thin u-fullHeight\'>\r\n  <div class=\'flexColumn panel-content panel-content--uncolored\'>\r\n    <div class=\'instruction-wrapper\'>\r\n      <div data-region=\'playlists\' class=\'flexColumn\'></div>\r\n    </div>\r\n    <div class=\'contentBar contentBar--bottom u-bordered--top flexColumn-bugFix\'>\r\n      <div data-ui=\'createPlaylistButton\' class=\'button button--flat\'>\r\n        ' +
((__t = ( createPlaylist )) == null ? '' : __t) +
'\r\n      </div>\r\n    </div>\r\n  </div>\r\n</div>';

}
return __p
};
exports["search_search"] = function(obj) {
obj || (obj = {});
var __t, __p = '', __e = _.escape;
with (obj) {
__p += '<div class=\'instruction-wrapper\'>\r\n  <div data-ui=\'typeToSearchMessage\' class=\'instruction\'>\r\n    <div class=\'instruction-header\'>\r\n      ' +
((__t = ( startTypingMessage )) == null ? '' : __t) +
'\r\n    </div>\r\n    <div class=\'instruction-content\'>\r\n      ' +
((__t = ( resultsWillAppearAsYouSearchMessage )) == null ? '' : __t) +
'\r\n    </div>\r\n  </div>\r\n\r\n  <div data-ui=\'searchingMessage\' class=\'instruction is-showingSpinner\'>\r\n    <div class=\'instruction-header\'>\r\n      ' +
((__t = ( searchingMessage )) == null ? '' : __t) +
'\r\n    </div>\r\n    <div data-region=\'spinner\'></div>\r\n  </div>\r\n\r\n  <div data-ui=\'noResultsMessage\' class=\'instruction\'>\r\n    <div class=\'instruction-header\'>\r\n      ' +
((__t = ( noResultsFoundMessage )) == null ? '' : __t) +
'\r\n    </div>\r\n    <div class=\'instruction-content\'>\r\n      ' +
((__t = ( trySearchingForSomethingElseMessage )) == null ? '' : __t) +
'\r\n    </div>\r\n  </div>\r\n\r\n  <div data-region=\'searchResults\' class=\'flexColumn\'></div>\r\n</div>\r\n\r\n<div class=\'contentBar contentBar--bottom u-bordered--top flexColumn-bugFix\'>\r\n  <div data-ui=\'playAllButton\' class=\'button button--flat\'>\r\n    ' +
((__t = ( playAllMessage )) == null ? '' : __t) +
'\r\n  </div>\r\n\r\n  <div data-ui=\'addAllButton tooltipable\' class=\'button button--flat\'>\r\n    ' +
((__t = ( addAllMessage )) == null ? '' : __t) +
'\r\n  </div>\r\n\r\n  <div data-ui=\'saveAllButton\' class=\'button button--flat\'>\r\n    ' +
((__t = ( saveAllMessage )) == null ? '' : __t) +
'\r\n  </div>\r\n</div>';

}
return __p
};
exports["search_searchResult"] = function(obj) {
obj || (obj = {});
var __t, __p = '', __e = _.escape;
with (obj) {
__p += '<div data-ui=\'leftContent\' class=\'listItem-leftContent is-showingThumbnail\'>\r\n  <div class=\'listItem-imageThumbnail\' style=\'background-image: url(\'https://img.youtube.com/vi/' +
((__t = ( video.get('id') )) == null ? '' : __t) +
'/mqdefault.jpg\')\' />\r\n  <div data-region=\'checkbox\' class=\'listItem-checkboxRegion\'></div>\r\n</div>\r\n\r\n<div class=\'listItem-content\'>\r\n  <div class=\'listItem-title\' data-ui=\'textTooltipable\' data-tooltip-text=\'' +
__e( video.get('title') ) +
'\'>\r\n    ' +
((__t = ( video.get('title') )) == null ? '' : __t) +
'\r\n  </div>\r\n\r\n  <div class=\'listItem-details\'>\r\n    ' +
((__t = ( video.get('prettyDuration') )) == null ? '' : __t) +
'\r\n  </div>\r\n</div>\r\n\r\n<span data-region=\'buttons\' class=\'listItem-buttonsRegion\'></span>';

}
return __p
};
exports["search_searchResults"] = function(obj) {
obj || (obj = {});
var __t, __p = '', __e = _.escape;
with (obj) {
__p += '<ol id=\'searchResults-list\' data-ui=\'listItems\' class=\'sortable--unsortable\'></ol>';

}
return __p
};
exports["selectionBar_selectionBar"] = function(obj) {
obj || (obj = {});
var __t, __p = '', __e = _.escape;
with (obj) {
__p += '<div class=\'contentBar contentBar--bottom\'>\r\n  <div data-ui=\'clearButton\' class=\'button button--icon button--icon--primary button--large contentBar-navButton\'>\r\n    ' +
((__t = ( closeIcon )) == null ? '' : __t) +
'\r\n  </div>\r\n\r\n  <div class=\'flexRow \'>\r\n    <div data-ui=\'selectionCountText\' class=\'contentBar-title u-lowercase u-textOverflowEllipsis text\'></div>\r\n  </div>\r\n\r\n  <div data-ui=\'playButton\' class=\'button button--flat\'>\r\n    ' +
((__t = ( playMessage )) == null ? '' : __t) +
'\r\n  </div>\r\n\r\n  <div data-ui=\'addButton tooltipable\' class=\'button button--flat\'>\r\n    ' +
((__t = ( addMessage )) == null ? '' : __t) +
'\r\n  </div>\r\n\r\n  <div data-ui=\'saveButton tooltipable\' class=\'button button--flat\'>\r\n    ' +
((__t = ( saveMessage )) == null ? '' : __t) +
'\r\n  </div>\r\n\r\n  <div data-ui=\'deleteButton tooltipable\' class=\'button button--flat\'>\r\n    ' +
((__t = ( deleteMessage )) == null ? '' : __t) +
'\r\n  </div>\r\n</div>';

}
return __p
};
exports["simpleMenu_simpleMenu"] = function(obj) {
obj || (obj = {});
var __t, __p = '', __e = _.escape;
with (obj) {
__p += '<div data-ui=\'panelContent\' class=\'menu-items panel-content panel-content--uncolored panel-content--fadeInOut\'>\r\n  <div data-region=\'fixedTopMenuItem\'></div>\r\n  <div data-region=\'simpleMenuItems\'></div>\r\n  <div data-region=\'fixedBottomMenuItem\'></div>\r\n</div>';

}
return __p
};
exports["simpleMenu_simpleMenuItem"] = function(obj) {
obj || (obj = {});
var __t, __p = '', __e = _.escape;
with (obj) {
__p += '<div class=\'listItem-content\'>\r\n  <div class=\'listItem-title\'>\r\n    ' +
((__t = ( text )) == null ? '' : __t) +
'\r\n  </div>\r\n</div>';

}
return __p
};
exports["stream_clearStreamButton"] = function(obj) {
obj || (obj = {});
var __t, __p = '', __e = _.escape;
with (obj) {
__p +=
((__t = ( clearMessage )) == null ? '' : __t);

}
return __p
};
exports["stream_saveStreamButton"] = function(obj) {
obj || (obj = {});
var __t, __p = '', __e = _.escape;
with (obj) {
__p +=
((__t = ( saveAllMessage )) == null ? '' : __t);

}
return __p
};
exports["stream_stream"] = function(obj) {
obj || (obj = {});
var __t, __p = '', __e = _.escape;
with (obj) {
__p += '<div class=\'instruction-wrapper\'>\r\n  <div data-ui=\'emptyMessage\' class=\'instruction\'>\r\n    <div class=\'instruction-header\'>\r\n      ' +
((__t = ( emptyMessage )) == null ? '' : __t) +
'\r\n    </div>\r\n    <div class=\'instruction-content\'>\r\n      ' +
((__t = ( whyNotAddAVideoFromAPlaylistOrMessage )) == null ? '' : __t) +
' <span data-ui=\'focusSearchInputLink\' class=\'u-link u-lowercase\'>' +
((__t = ( searchForVideosMessage )) == null ? '' : __t) +
'</span>?\r\n    </div>\r\n  </div>\r\n\r\n  <div data-region=\'streamItems\' class=\'flexColumn\'></div>\r\n</div>\r\n\r\n<div class=\'contentBar contentBar--bottom u-bordered--top flexColumn-bugFix\'>\r\n  <div class=\'contentBar--bottom-text--left flexRow\'>\r\n    <div data-ui=\'streamDetails textTooltipable\' class=\'u-lowercase u-textOverflowEllipsis text u-textSecondary\'></div>\r\n  </div>\r\n  <div data-region=\'saveStreamButton\'></div>\r\n  <div data-region=\'clearStreamButton\'></div>\r\n</div>';

}
return __p
};
exports["stream_streamItem"] = function(obj) {
obj || (obj = {});
var __t, __p = '', __e = _.escape;
with (obj) {
__p += '<div data-ui=\'leftContent\' class=\'listItem-leftContent is-showingThumbnail\'>\r\n  <div class=\'listItem-imageThumbnail\' style=\'background-image: url(\'https://img.youtube.com/vi/' +
((__t = ( video.get('id') )) == null ? '' : __t) +
'/mqdefault.jpg\')\' />\r\n  <div data-region=\'checkbox\' class=\'listItem-checkboxRegion\'></div>\r\n</div>\r\n\r\n<div class=\'listItem-content\'>\r\n  <div class=\'listItem-title\' data-ui=\'textTooltipable\' data-tooltip-text=\'' +
__e( video.get('title') ) +
'\'>\r\n    ' +
((__t = ( video.get('title') )) == null ? '' : __t) +
'\r\n  </div>\r\n\r\n  <div class=\'listItem-details\'>\r\n    ' +
((__t = ( video.get('prettyDuration') )) == null ? '' : __t) +
'\r\n  </div>\r\n</div>\r\n\r\n<span data-region=\'buttons\' class=\'listItem-buttonsRegion\'></span>';

}
return __p
};
exports["stream_streamItems"] = function(obj) {
obj || (obj = {});
var __t, __p = '', __e = _.escape;
with (obj) {
__p += '<ol id=\'streamItems-list\' data-ui=\'listItems\' class=\'js-droppable\'></ol>';

}
return __p
};
exports["streamControlBar_nextButton"] = function(obj) {
obj || (obj = {});
var __t, __p = '', __e = _.escape;
with (obj) {
__p +=
((__t = ( nextIcon )) == null ? '' : __t);

}
return __p
};
exports["streamControlBar_playPauseButton"] = function(obj) {
obj || (obj = {});
var __t, __p = '', __e = _.escape;
with (obj) {
__p += '<span data-ui=\'pauseIcon\'>\r\n    ' +
((__t = ( pauseIcon )) == null ? '' : __t) +
'\r\n</span>\r\n\r\n<span data-ui=\'playIcon\'>\r\n    ' +
((__t = ( playIcon )) == null ? '' : __t) +
'\r\n</span>';

}
return __p
};
exports["streamControlBar_previousButton"] = function(obj) {
obj || (obj = {});
var __t, __p = '', __e = _.escape;
with (obj) {
__p +=
((__t = ( previousIcon )) == null ? '' : __t);

}
return __p
};
exports["streamControlBar_radioButton"] = function(obj) {
obj || (obj = {});
var __t, __p = '', __e = _.escape;
with (obj) {
__p +=
((__t = ( radioIcon )) == null ? '' : __t);

}
return __p
};
exports["streamControlBar_repeatButton"] = function(obj) {
obj || (obj = {});
var __t, __p = '', __e = _.escape;
with (obj) {
__p += '<span data-ui=\'repeatIcon\'>\r\n  ' +
((__t = ( repeatIcon )) == null ? '' : __t) +
'\r\n</span>\r\n\r\n<span data-ui=\'repeatOneIcon\'>\r\n  ' +
((__t = ( repeatOneIcon )) == null ? '' : __t) +
'\r\n</span>';

}
return __p
};
exports["streamControlBar_shuffleButton"] = function(obj) {
obj || (obj = {});
var __t, __p = '', __e = _.escape;
with (obj) {
__p +=
((__t = ( shuffleIcon )) == null ? '' : __t);

}
return __p
};
exports["streamControlBar_streamControlBar"] = function(obj) {
obj || (obj = {});
var __t, __p = '', __e = _.escape;
with (obj) {
__p += '<div class=\'flexColumn\'>\r\n  <div class=\'flexRow\'>\r\n    <div data-ui=\'content\' class=\'flexColumn streamControlBar-content\'>\r\n      <div class=\'streamControlBar-title u-textOverflowEllipsis text\' data-ui=\'title textTooltipable\'></div>\r\n      <div data-region=\'timeLabelArea\'></div>\r\n    </div>\r\n\r\n    <div class=\'streamControlBar-streamControls\'>\r\n      <div data-region=\'radioButton\'></div>\r\n      <div data-region=\'shuffleButton\'></div>\r\n      <div data-region=\'repeatButton\'></div>\r\n    </div>\r\n\r\n    <div class=\'streamControlBar-playbackControls\'>\r\n      <div data-region=\'previousButton\'></div>\r\n      <div data-region=\'playPauseButton\'></div>\r\n      <div data-region=\'nextButton\'></div>\r\n      <div data-region=\'volumeArea\'></div>\r\n    </div>\r\n  </div>\r\n  <div data-region=\'timeSlider\'></div>\r\n</div>';

}
return __p
};
exports["streamControlBar_timeLabelArea"] = function(obj) {
obj || (obj = {});
var __t, __p = '', __e = _.escape;
with (obj) {
__p += '<div data-ui=\'elapsedTimeLabel tooltipable\' class=\'timeArea-label text is-clickable\'></div>\r\n<div class=\'timeArea-label text\'>/</div>\r\n<div data-ui=\'totalTimeLabel tooltipable\' class=\'timeArea-label text\'></div>';

}
return __p
};
exports["streamControlBar_timeSlider"] = function(obj) {
obj || (obj = {});
var __t, __p = '', __e = _.escape;
with (obj) {
__p += '';

}
return __p
};
exports["streamControlBar_volumeArea"] = function(obj) {
obj || (obj = {});
var __t, __p = '', __e = _.escape;
with (obj) {
__p += '<div data-ui=\'volumeButton\' class=\'volumeArea-volumeButton button button--icon--secondary button--icon button--large\'>\r\n  <span data-ui=\'volumeIcon--up\'>\r\n    ' +
((__t = ( volumeUpIcon )) == null ? '' : __t) +
'\r\n  </span>\r\n\r\n  <span data-ui=\'volumeIcon--down\'>\r\n    ' +
((__t = ( volumeDownIcon )) == null ? '' : __t) +
'\r\n  </span>\r\n\r\n  <span data-ui=\'volumeIcon--off\'>\r\n    ' +
((__t = ( volumeOffIcon )) == null ? '' : __t) +
'\r\n  </span>\r\n\r\n  <span data-ui=\'volumeIcon--mute\'>\r\n    ' +
((__t = ( volumeMuteIcon )) == null ? '' : __t) +
'\r\n  </span>\r\n</div>\r\n\r\n<div data-ui=\'slidePanel\' class=\'volumeArea-slidePanel panel\'>\r\n  <div class=\'volumeArea-slidePanel-content panel-content panel-content--uncolored flexColumn\'>\r\n    <streamus-slider data-ui=\'volumeSlider\' orientation=\'vertical\' wheelStepScale=\'3\'></streamus-slider>\r\n  </div>\r\n</div>';

}
return __p
};
exports["tooltip_tooltip"] = function(obj) {
obj || (obj = {});
var __t, __p = '', __e = _.escape;
with (obj) {
__p += '<div data-ui=\'panelContent\' class=\'tooltip-content panel-content panel-content--fadeInOut\'>\r\n  ' +
__e( text ) +
'\r\n</div>';

}
return __p
};
exports["icon_addIcon_18"] = function(obj) {
obj || (obj = {});
var __t, __p = '', __e = _.escape;
with (obj) {
__p += '<svg viewBox=\'0 0 18 18\' height=\'18\' width=\'18\'>\r\n    <path d=\'M 3,4.5 H 1.5 V 15 c 0,0.825 0.675,1.5 1.5,1.5 H 13.5 V 15 H 3 V 4.5 z m 12,-3 H 6 C 5.175,1.5 4.5,2.175 4.5,3 v 9 c 0,0.825 0.675,1.5 1.5,1.5 h 9 c 0.825,0 1.5,-0.675 1.5,-1.5 V 3 C 16.5,2.175 15.825,1.5 15,1.5 z m -0.75,6.75 h -3 v 3 h -1.5 v -3 h -3 v -1.5 h 3 v -3 h 1.5 v 3 h 3 v 1.5 z\' />\r\n</svg>';

}
return __p
};
exports["icon_closeIcon_24"] = function(obj) {
obj || (obj = {});
var __t, __p = '', __e = _.escape;
with (obj) {
__p += '<svg width=\'24\' height=\'24\' viewBox=\'0 0 24 24\'>\r\n    <path d=\'M19 6.41l-1.41-1.41-5.59 5.59-5.59-5.59-1.41 1.41 5.59 5.59-5.59 5.59 1.41 1.41 5.59-5.59 5.59 5.59 1.41-1.41-5.59-5.59z\'/>\r\n    <path d=\'M0 0h24v24h-24z\' fill=\'none\'/>\r\n</svg>\r\n';

}
return __p
};
exports["icon_deleteIcon_18"] = function(obj) {
obj || (obj = {});
var __t, __p = '', __e = _.escape;
with (obj) {
__p += '<svg width=\'18\' height=\'18\' viewBox=\'0 0 18 18\'>\r\n    <path d=\'M5.0 14.0C4.78571428571 15.3 5.49285714286 16.0 6.35714285714 16.0L12.6428571429 16.0C13.2928571428 16.0 14.0 15.3 14.0 14.4444444444L14.0 5.0L5.0 5.0L5.0 14.4444444444ZM15.0 3.0L12.25 3.0L11.4642857143 2.0L7.53571428571 2.0L6.75 3.0L4.0 3.0L4.0 4.0L15.0 4.0L15.0 2.77777777778Z\' />\r\n</svg>';

}
return __p
};
exports["icon_menuIcon_24"] = function(obj) {
obj || (obj = {});
var __t, __p = '', __e = _.escape;
with (obj) {
__p += '<svg width=\'24\' height=\'24\' viewBox=\'0 0 24 24\'>\r\n    <path d=\'M0 0h24v24h-24z\' fill=\'none\'/>\r\n    <path d=\'M3 18h18v-2h-18v2zm0-5h18v-2h-18v2zm0-7v2h18v-2h-18z\'/>\r\n</svg>\r\n';

}
return __p
};
exports["icon_nextIcon_24"] = function(obj) {
obj || (obj = {});
var __t, __p = '', __e = _.escape;
with (obj) {
__p += '<svg width=\'24\' height=\'24\' viewBox=\'0 0 24 24\'>\r\n    <path d=\'M6 18l8.5-6L6 6v12zM16 6v12h2V6h-2z\'/>\r\n    <path d=\'M0 0h24v24H0z\' fill=\'none\'/>\r\n</svg>\r\n';

}
return __p
};
exports["icon_optionsIcon_18"] = function(obj) {
obj || (obj = {});
var __t, __p = '', __e = _.escape;
with (obj) {
__p += '<svg width=\'18\' height=\'18\' viewBox=\'0 0 18 18\'>\r\n    <path d=\'M9 5.5c.83 0 1.5-.67 1.5-1.5S9.83 2.5 9 2.5 7.5 3.17 7.5 4 8.17 5.5 9 5.5zm0 2c-.83 0-1.5.67-1.5 1.5s.67 1.5 1.5 1.5 1.5-.67 1.5-1.5S9.83 7.5 9 7.5zm0 5c-.83 0-1.5.67-1.5 1.5s.67 1.5 1.5 1.5 1.5-.67 1.5-1.5-.67-1.5-1.5-1.5z\'/>\r\n</svg>';

}
return __p
};
exports["icon_pauseIcon_18"] = function(obj) {
obj || (obj = {});
var __t, __p = '', __e = _.escape;
with (obj) {
__p += '<svg width=\'18\' height=\'18\'>\r\n    <path transform=\'matrix(1.000000,0.000000,0.000000,1.000000,0.000000,0.000000)\' d=\'M5.0 15.0L8.0 15.0L8.0 4.0L5.0 4.0L5.0 15.0ZM11.0 4.0L11.0 15.0L14.0 15.0L14.0 4.0L11.0 4.0Z\' />\r\n    <path transform=\'matrix(1.000000,0.000000,0.000000,1.000000,0.000000,0.000000)\' d=\'M5.0 15.0L8.0 15.0L8.0 4.0L5.0 4.0L5.0 15.0ZM11.0 4.0L11.0 15.0L14.0 15.0L14.0 4.0L11.0 4.0Z\'/>\r\n</svg>';

}
return __p
};
exports["icon_pauseIcon_30"] = function(obj) {
obj || (obj = {});
var __t, __p = '', __e = _.escape;
with (obj) {
__p += '<svg width=\'30\' height=\'30\' viewBox=\'0 0 30 30\'>\r\n    <path d=\'M8.0 24.0L13.0 24.0L13.0 6.0L8.0 6.0L8.0 24.0ZM18.0 6.0L18.0 24.0L23.0 24.0L23.0 6.0L18.0 6.0Z\' />\r\n</svg>';

}
return __p
};
exports["icon_playIcon_18"] = function(obj) {
obj || (obj = {});
var __t, __p = '', __e = _.escape;
with (obj) {
__p += '<svg width=\'18\' height=\'18\' viewBox=\'0 0 18 18\'>\r\n    <path d=\'M 5,2 V 16 L 16,9 z\' />\r\n</svg>';

}
return __p
};
exports["icon_playIcon_30"] = function(obj) {
obj || (obj = {});
var __t, __p = '', __e = _.escape;
with (obj) {
__p += '<svg width=\'30\' height=\'30\' viewBox=\'0 0 30 30\'>\r\n    <path d=\'M10.0 6.0L10.0 24.0L24.0 15.0Z\' />\r\n</svg>';

}
return __p
};
exports["icon_previousIcon_24"] = function(obj) {
obj || (obj = {});
var __t, __p = '', __e = _.escape;
with (obj) {
__p += '<svg width=\'24\' height=\'24\' viewBox=\'0 0 24 24\'>\r\n    <path d=\'M6 6h2v12H6zm3.5 6l8.5 6V6z\'/>\r\n    <path d=\'M0 0h24v24H0z\' fill=\'none\'/>\r\n</svg>\r\n';

}
return __p
};
exports["icon_radioIcon_18"] = function(obj) {
obj || (obj = {});
var __t, __p = '', __e = _.escape;
with (obj) {
__p += '<svg width=\'18\' height=\'18\' viewBox=\'0 0 18 18\'>\r\n    <path d=\'M3.0 5.0C2.3825 5.13714285714 2.0 5.70095238095 2.0 6.33333333333L2.0 15.4761904762C2.0 16.3142857143 2.6675 17.0 3.5 17.0L15.5 17.0C16.3325 17.0 17.0 16.3142857143 17.0 15.4761904762L17.0 6.33333333333C17.0 5.6780952381 16.3325 5.0 15.5 5.0L6.725 5.0L12.92 2.26476190476L12.41 1.0L2.93 4.92380952381ZM5.75 15.4761904762C4.505 15.4761904762 3.5 14.4552380952 3.5 13.1904761905C3.5 11.9257142857 4.505 10.9047619048 5.75 10.9047619048C6.995 10.9047619048 8.0 11.9257142857 8.0 13.1904761905C8.0 14.4552380952 6.995 15.4761904762 5.75 15.4761904762ZM15.5 9.0L14.0 9.0L14.0 8.0L13.0 8.0L13.0 9.0L4.0 9.0L4.0 6.0L16.0 6.0L16.0 9.38095238095Z\' />\r\n</svg>';

}
return __p
};
exports["icon_repeatIcon_18"] = function(obj) {
obj || (obj = {});
var __t, __p = '', __e = _.escape;
with (obj) {
__p += '<svg width=\'18\' height=\'18\' viewBox=\'0 0 18 18\'>\r\n    <path d=\'M5.0 6.0L13.0 6.0L13.0 8.0L16.0 5.0L13.0 2.0L13.0 4.0L4.0 4.0L4.0 9.0L5.0 9.0L5.0 5.75ZM12.8888888889 13.0L5.0 13.0L5.0 11.0L2.0 14.0L5.0 17.0L5.0 15.0L14.0 15.0L14.0 10.0L13.0 10.0L13.0 13.25Z\' />\r\n</svg>';

}
return __p
};
exports["icon_repeatOneIcon_18"] = function(obj) {
obj || (obj = {});
var __t, __p = '', __e = _.escape;
with (obj) {
__p += '<svg width=\'18\' height=\'18\' viewBox=\'0 0 18 18\'>\r\n    <path d=\'M5.0 6.0L13.0 6.0L13.0 8.0L16.0 5.0L13.0 2.0L13.0 4.0L4.0 4.0L4.0 9.0L5.0 9.0L5.0 5.75ZM12.8888888889 13.0L5.0 13.0L5.0 11.0L2.0 14.0L5.0 17.0L5.0 15.0L14.0 15.0L14.0 10.0L13.0 10.0L13.0 13.25ZM10.0 11.75L10.0 7.0L9.0 7.0L7.0 8.0L7.0 9.0L9.0 9.0L9.0 12.0L9.7777777778 12.0Z\' />\r\n</svg>';

}
return __p
};
exports["icon_saveIcon_18"] = function(obj) {
obj || (obj = {});
var __t, __p = '', __e = _.escape;
with (obj) {
__p += '<svg width=\'18\' height=\'18\' viewBox=\'0 0 18 18\'>\r\n    <path d=\'M13.0 2.0L3.55555555556 2.0C2.69222222222 2.0 2.0 2.7 2.0 3.55555555556L2.0 14.4444444444C2.0 15.3 2.69222222222 16.0 3.55555555556 16.0L14.4444444444 16.0C15.3 16.0 16.0 15.3 16.0 14.4444444444L16.0 5.11111111111L12.8888888889 2.0ZM9.0 14.4444444444C7.70888888889 14.4444444444 6.66666666667 13.4022222222 6.66666666667 12.1111111111C6.66666666667 10.82 7.70888888889 9.7777777778 9.0 9.7777777778C10.2911111111 9.7777777778 11.3333333333 10.82 11.3333333333 12.1111111111C11.3333333333 13.4022222222 10.2911111111 14.4444444444 9.0 14.4444444444ZM11.3333333333 7.0L4.0 7.0L4.0 4.0L11.0 4.0L11.0 6.66666666667Z\' />\r\n</svg>';

}
return __p
};
exports["icon_searchIcon_24"] = function(obj) {
obj || (obj = {});
var __t, __p = '', __e = _.escape;
with (obj) {
__p += '<svg width=\'24\' height=\'24\' viewBox=\'0 0 24 24\'>\r\n    <path d=\'M15.5 14h-.79l-.28-.27c.98-1.14 1.57-2.62 1.57-4.23 0-3.59-2.91-6.5-6.5-6.5s-6.5 2.91-6.5 6.5 2.91 6.5 6.5 6.5c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99 1.49-1.49-4.99-5zm-6 0c-2.49 0-4.5-2.01-4.5-4.5s2.01-4.5 4.5-4.5 4.5 2.01 4.5 4.5-2.01 4.5-4.5 4.5z\'/>\r\n    <path d=\'M0 0h24v24h-24z\' fill=\'none\'/>\r\n</svg>\r\n';

}
return __p
};
exports["icon_settingsIcon_24"] = function(obj) {
obj || (obj = {});
var __t, __p = '', __e = _.escape;
with (obj) {
__p += '<svg width=\'24\' height=\'24\' viewBox=\'0 0 24 24\'>\r\n    <path d=\'M0 0h24v24h-24z\' fill=\'none\'/>\r\n    <path d=\'M12 8c1.1 0 2-.9 2-2s-.9-2-2-2-2 .9-2 2 .9 2 2 2zm0 2c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zm0 6c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2z\'/>\r\n</svg>';

}
return __p
};
exports["icon_shuffleIcon_18"] = function(obj) {
obj || (obj = {});
var __t, __p = '', __e = _.escape;
with (obj) {
__p += '<svg width=\'18\' height=\'18\' viewBox=\'0 0 18 18\'>\r\n    <path d=\'M8.0 7.0L4.0575 3.0L3.0 4.0575L6.8775 7.935L7.9425 6.8775ZM10.875 3.0L12.405 4.53L3.0 13.9425L4.0575 15.0L13.47 5.595L15.0 7.125L15.0 3.0L10.875 3.0ZM11.1225 10.0575L10.065 11.115L12.4125 13.4625L10.875 15.0L15.0 15.0L15.0 10.875L13.47 12.405L11.1225 10.0575Z\' />\r\n</svg>';

}
return __p
};
exports["icon_volumeDownIcon_24"] = function(obj) {
obj || (obj = {});
var __t, __p = '', __e = _.escape;
with (obj) {
__p += '<svg width=\'24\' height=\'24\' viewBox=\'0 0 24 24\'>\r\n    <path d=\'M18.5 12c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02zM5 9v6h4l5 5V4L9 9H5z\'/>\r\n</svg>';

}
return __p
};
exports["icon_volumeMuteIcon_24"] = function(obj) {
obj || (obj = {});
var __t, __p = '', __e = _.escape;
with (obj) {
__p += '<svg width=\'24\' height=\'24\' viewBox=\'0 0 24 24\'>\r\n    <path d=\'M16.5 12c0-1.77-1.02-3.29-2.5-4.03v2.21l2.45 2.45c.03-.2.05-.41.05-.63zm2.5 0c0 .94-.2 1.82-.54 2.64l1.51 1.51C20.63 14.91 21 13.5 21 12c0-4.28-2.99-7.86-7-8.77v2.06c2.89.86 5 3.54 5 6.71zM4.27 3L3 4.27 7.73 9H3v6h4l5 5v-6.73l4.25 4.25c-.67.52-1.42.93-2.25 1.18v2.06c1.38-.31 2.63-.95 3.69-1.81L19.73 21 21 19.73l-9-9L4.27 3zM12 4L9.91 6.09 12 8.18V4z\'/>\r\n</svg>';

}
return __p
};
exports["icon_volumeOffIcon_24"] = function(obj) {
obj || (obj = {});
var __t, __p = '', __e = _.escape;
with (obj) {
__p += '<svg width=\'24\' height=\'24\' viewBox=\'0 0 24 24\'>\r\n    <path d=\'M7 9v6h4l5 5V4l-5 5H7z\'/>\r\n</svg>';

}
return __p
};
exports["icon_volumeUpIcon_24"] = function(obj) {
obj || (obj = {});
var __t, __p = '', __e = _.escape;
with (obj) {
__p += '<svg width=\'24\' height=\'24\' viewBox=\'0 0 24 24\'>\r\n    <path d=\'M3 9v6h4l5 5V4L7 9H3zm13.5 3c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02zM14 3.23v2.06c2.89.86 5 3.54 5 6.71s-2.11 5.85-5 6.71v2.06c4.01-.91 7-4.49 7-8.77s-2.99-7.86-7-8.77z\'/>\r\n</svg>';

}
return __p
};