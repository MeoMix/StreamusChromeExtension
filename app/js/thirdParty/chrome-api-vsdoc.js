// <copyright project="http://code.google.com/p/chrome-api-vsdoc/" file="chrome-api-vsdoc.js" author="Wesley Johnson">
// This source is licensed under The GNU General Public License (GPL) Version 2
// </copyright>

// This file contains documented stubs to support Visual Studio intellisense
// when working with Google's chrome extension APIs.
// You should not reference this file in a page at design time or runtime.
// To enable intellisense when authoring chrome extensions, place a commented
// reference to this file in your extension's JavaScript files like so: ///<reference path="chrome-api-vsdoc.js"/>

chrome = {
    alarms: {
        clear: function (name) {
            ///<summary>Clears the alarm with the given name.</summary>
            ///<param name='name' type='string'> (optional) The name of the alarm to clear. Defaults to the empty string.</param>
        },
        clearAll: function () { },
        create: function (name, alarmInfo) {
            ///<summary>Creates an alarm. Near the time(s) specified by alarmInfo , the onAlarm event is fired. If there is another alarm with the same name (or no name if none is specified), it will be cancelled and replaced by this alarm. In order to reduce the load on the user's machine, Chrome limits alarms to at most once every 1 minute but may delay them an arbitrary amount more. That is, setting delayInMinutes or periodInMinutes to less than 1 will not be honored and will cause a warning. when can be set to less than 1 minute after \now\ without warning but won't actually cause the alarm to fire for at least 1 minute. To help you debug your app or extension, when you've loaded it unpacked, there's no limit to how often the alarm can fire.</summary>
            ///<param name='name' type='string'> (optional) Optional name to identify this alarm. Defaults to the empty string.</param> 
            ///<param name='alarmInfo' type='object'>None{delayInMinutes: (optional double), periodInMinutes: (optional double), when: (optional double)}</param>
        },
        get: function (name, callback) {
            ///<summary>Retrieves details about the specified alarm.</summary>
            ///<param name='name' type='string'> (optional) The name of the alarm to get. Defaults to the empty string.</param> 
            ///<param name='callback' type='function'>function( Alarm alarm) {...} ;</param>
        },
        getAll: function (callback) {
            ///<summary>Gets an array of all the alarms.</summary>
            ///<param name='callback' type='function'>function(array of Alarm alarms) {...} ;</param>
        },
        onAlarm: {
            addListener: function (callback) {
                ///<summary>Fired when an alarm has elapsed. Useful for event pages.</summary>
                ///<param name='callback' type='function'>function( Alarm alarm) {...} ;</param>
            }
        }
    },
    bookmarks: {
        create: function (bookmark, callback) {
            ///<summary>Creates a bookmark or folder under the specified parentId. If url is NULL or missing, it will be a folder.</summary>
            ///<param name='bookmark' type='object'>{url: (optional string), index: (optional integer), title: (optional string), parentId: (optional string)}</param> 
            ///<param name='callback' type='function'> (optional) function( BookmarkTreeNode result) {...} ;</param>
        },
        get: function (idOrIdList, callback) {
            ///<summary>Retrieves the specified BookmarkTreeNode(s).</summary>
            ///<param name='idOrIdList' type='string or array of string'>A single string-valued id, or an array of string-valued ids</param> 
            ///<param name='callback' type='function'>function(array of BookmarkTreeNode results) {...} ;</param>
        },
        getChildren: function (id, callback) {
            ///<summary>Retrieves the children of the specified BookmarkTreeNode id.</summary>
            ///<param name='id' type='string'></param> 
            ///<param name='callback' type='function'>function(array of BookmarkTreeNode results) {...} ;</param>
        },
        getRecent: function (numberOfItems, callback) {
            ///<summary>Retrieves the recently added bookmarks.</summary>
            ///<param name='numberOfItems' type='integer'>The maximum number of items to return.</param> 
            ///<param name='callback' type='function'>function(array of BookmarkTreeNode results) {...} ;</param>
        },
        getSubTree: function (id, callback) {
            ///<summary>Retrieves part of the Bookmarks hierarchy, starting at the specified node.</summary>
            ///<param name='id' type='string'>The ID of the root of the subtree to retrieve.</param> 
            ///<param name='callback' type='function'>function(array of BookmarkTreeNode results) {...} ;</param>
        },
        getTree: function (callback) {
            ///<summary>Retrieves the entire Bookmarks hierarchy.</summary>
            ///<param name='callback' type='function'>function(array of BookmarkTreeNode results) {...} ;</param>
        },
        move: function (id, destination, callback) {
            ///<summary>Moves the specified BookmarkTreeNode to the provided location.</summary>
            ///<param name='id' type='string'></param> 
            ///<param name='destination' type='object'>{index: (optional integer), parentId: (optional string)}</param> 
            ///<param name='callback' type='function'> (optional) function( BookmarkTreeNode result) {...} ;</param>
        },
        onChanged: {
            addListener: function (callback) {
                ///<summary>Fired when a bookmark or folder changes. Note: Currently, only title and url changes trigger this.</summary>
                ///<param name='callback' type='function'>function(string id, object changeInfo) {...} ;</param>
            }
        },
        onChildrenReordered: {
            addListener: function (callback) {
                ///<summary>Fired when the children of a folder have changed their order due to the order being sorted in the UI. This is not called as a result of a move().</summary>
                ///<param name='callback' type='function'>function(string id, object reorderInfo) {...} ;</param>
            }
        },
        onCreated: {
            addListener: function (callback) {
                ///<summary>Fired when a bookmark or folder is created.</summary>
                ///<param name='callback' type='function'>function(string id, BookmarkTreeNode bookmark) {...} ;</param>
            }
        },
        onImportBegan: {
            addListener: function (callback) {
                ///<summary>Fired when a bookmark import session is begun. Expensive observers should ignore onCreated updates until onImportEnded is fired. Observers should still handle other notifications immediately.</summary>
                ///<param name='callback' type='function'>function() {...} ;</param>
            }
        },
        onImportEnded: {
            addListener: function (callback) {
                ///<summary>Fired when a bookmark import session is ended.</summary>
                ///<param name='callback' type='function'>function() {...} ;</param>
            }
        },
        onMoved: {
            addListener: function (callback) {
                ///<summary>Fired when a bookmark or folder is moved to a different parent folder.</summary>
                ///<param name='callback' type='function'>function(string id, object moveInfo) {...} ;</param>
            }
        },
        onRemoved: {
            addListener: function (callback) {
                ///<summary>Fired when a bookmark or folder is removed. When a folder is removed recursively, a single notification is fired for the folder, and none for its contents.</summary>
                ///<param name='callback' type='function'>function(string id, object removeInfo) {...} ;</param>
            }
        },
        remove: function (id, callback) {
            ///<summary>Removes a bookmark or an empty bookmark folder.</summary>
            ///<param name='id' type='string'></param> 
            ///<param name='callback' type='function'> (optional) function() {...} ;</param>
        },
        removeTree: function (id, callback) {
            ///<summary>Recursively removes a bookmark folder.</summary>
            ///<param name='id' type='string'></param> 
            ///<param name='callback' type='function'> (optional) function() {...} ;</param>
        },
        search: function (query, callback) {
            ///<summary>Searches for BookmarkTreeNodes matching the given query.</summary>
            ///<param name='query' type='string'></param> 
            ///<param name='callback' type='function'>function(array of BookmarkTreeNode results) {...} ;</param>
        },
        update: function (id, changes, callback) {
            ///<summary>Updates the properties of a bookmark or folder. Specify only the properties that you want to change; unspecified properties will be left unchanged. Note: Currently, only 'title' and 'url' are supported.</summary>
            ///<param name='id' type='string'></param> 
            ///<param name='changes' type='object'>{url: (optional string), title: (optional string)}</param> 
            ///<param name='callback' type='function'> (optional) function( BookmarkTreeNode result) {...} ;</param>
        }
    },
    browserAction: {
        disable: function (tabId) {
            ///<summary>Disables the browser action for a tab.</summary>
            ///<param name='tabId' type='integer'> (optional) The id of the tab for which you want to modify the browser action.</param>
        },
        enable: function (tabId) {
            ///<summary>Enables the browser action for a tab. By default, browser actions are enabled.</summary>
            ///<param name='tabId' type='integer'> (optional) The id of the tab for which you want to modify the browser action.</param>
        },
        getBadgeBackgroundColor: function (details, callback) {
            ///<summary>Gets the background color of the browser action.</summary>
            ///<param name='details' type='object'>{tabId: (optional integer), imageData: (optional ImageDataType orobject), title: (string), color: (stringor ColorArray ), text: (string), popup: (string), path: (optional stringorobject)}</param> 
            ///<param name='callback' type='function'>function( ColorArray result) {...} ;</param>
        },
        getBadgeText: function (details, callback) {
            ///<summary>Gets the badge text of the browser action. If no tab is specified, the non-tab-specific badge text is returned.</summary>
            ///<param name='details' type='object'>{tabId: (optional integer), imageData: (optional ImageDataType orobject), title: (string), color: (stringor ColorArray ), text: (string), popup: (string), path: (optional stringorobject)}</param> 
            ///<param name='callback' type='function'>function(string result) {...} ;</param>
        },
        getPopup: function (details, callback) {
            ///<summary>Gets the html document set as the popup for this browser action.</summary>
            ///<param name='details' type='object'>{tabId: (optional integer), imageData: (optional ImageDataType orobject), title: (string), color: (stringor ColorArray ), text: (string), popup: (string), path: (optional stringorobject)}</param> 
            ///<param name='callback' type='function'>function(string result) {...} ;</param>
        },
        getTitle: function (details, callback) {
            ///<summary>Gets the title of the browser action.</summary>
            ///<param name='details' type='object'>{tabId: (optional integer), imageData: (optional ImageDataType orobject), title: (string), color: (stringor ColorArray ), text: (string), popup: (string), path: (optional stringorobject)}</param> 
            ///<param name='callback' type='function'>function(string result) {...} ;</param>
        },
        onClicked: {
            addListener: function (callback) {
                ///<summary>Fired when a browser action icon is clicked. This event will not fire if the browser action has a popup.</summary>
                ///<param name='callback' type='function'>function( tabs.Tab tab) {...} ;</param>
            }
        },
        setBadgeBackgroundColor: function (details) {
            ///<summary>Sets the background color for the badge.</summary>
            ///<param name='details' type='object'>{tabId: (optional integer), imageData: (optional ImageDataType orobject), title: (string), color: (stringor ColorArray ), text: (string), popup: (string), path: (optional stringorobject)}</param>
        },
        setBadgeText: function (details) {
            ///<summary>Sets the badge text for the browser action. The badge is displayed on top of the icon.</summary>
            ///<param name='details' type='object'>{tabId: (optional integer), imageData: (optional ImageDataType orobject), title: (string), color: (stringor ColorArray ), text: (string), popup: (string), path: (optional stringorobject)}</param>
        },
        setIcon: function (details, callback) {
            ///<summary>Sets the icon for the browser action. The icon can be specified either as the path to an image file or as the pixel data from a canvas element, or as dictionary of either one of those. Either the path or the imageData property must be specified.</summary>
            ///<param name='details' type='object'>{tabId: (optional integer), imageData: (optional ImageDataType orobject), title: (string), color: (stringor ColorArray ), text: (string), popup: (string), path: (optional stringorobject)}</param> 
            ///<param name='callback' type='function'> (optional) function() {...} ;</param>
        },
        setPopup: function (details) {
            ///<summary>Sets the html document to be opened as a popup when the user clicks on the browser action's icon.</summary>
            ///<param name='details' type='object'>{tabId: (optional integer), imageData: (optional ImageDataType orobject), title: (string), color: (stringor ColorArray ), text: (string), popup: (string), path: (optional stringorobject)}</param>
        },
        setTitle: function (details) {
            ///<summary>Sets the title of the browser action. This shows up in the tooltip.</summary>
            ///<param name='details' type='object'>{tabId: (optional integer), imageData: (optional ImageDataType orobject), title: (string), color: (stringor ColorArray ), text: (string), popup: (string), path: (optional stringorobject)}</param>
        }
    },
    browsingData: {
        remove: function (options, dataToRemove, callback) {
            ///<summary>Clears various types of browsing data stored in a user's profile.</summary>
            ///<param name='options' type='RemovalOptions'></param> 
            ///<param name='dataToRemove' type='DataTypeSet'>The set of data types to remove.</param> 
            ///<param name='callback' type='function'> (optional) function() {...} ;</param>
        },
        removeAppcache: function (options, callback) {
            ///<summary>Clears websites' appcache data.</summary>
            ///<param name='options' type='RemovalOptions'></param> 
            ///<param name='callback' type='function'> (optional) function() {...} ;</param>
        },
        removeCache: function (options, callback) {
            ///<summary>Clears the browser's cache.</summary>
            ///<param name='options' type='RemovalOptions'></param> 
            ///<param name='callback' type='function'> (optional) function() {...} ;</param>
        },
        removeCookies: function (options, callback) {
            ///<summary>Clears the browser's cookies and server-bound certificates modified within a particular timeframe.</summary>
            ///<param name='options' type='RemovalOptions'></param> 
            ///<param name='callback' type='function'> (optional) function() {...} ;</param>
        },
        removeDownloads: function (options, callback) {
            ///<summary>Clears the browser's list of downloaded files ( not the downloaded files themselves).</summary>
            ///<param name='options' type='RemovalOptions'></param> 
            ///<param name='callback' type='function'> (optional) function() {...} ;</param>
        },
        removeFileSystems: function (options, callback) {
            ///<summary>Clears websites' file system data.</summary>
            ///<param name='options' type='RemovalOptions'></param> 
            ///<param name='callback' type='function'> (optional) function() {...} ;</param>
        },
        removeFormData: function (options, callback) {
            ///<summary>Clears the browser's stored form data (autofill).</summary>
            ///<param name='options' type='RemovalOptions'></param> 
            ///<param name='callback' type='function'> (optional) function() {...} ;</param>
        },
        removeHistory: function (options, callback) {
            ///<summary>Clears the browser's history.</summary>
            ///<param name='options' type='RemovalOptions'></param> 
            ///<param name='callback' type='function'> (optional) function() {...} ;</param>
        },
        removeIndexedDB: function (options, callback) {
            ///<summary>Clears websites' IndexedDB data.</summary>
            ///<param name='options' type='RemovalOptions'></param> 
            ///<param name='callback' type='function'> (optional) function() {...} ;</param>
        },
        removeLocalStorage: function (options, callback) {
            ///<summary>Clears websites' local storage data.</summary>
            ///<param name='options' type='RemovalOptions'></param> 
            ///<param name='callback' type='function'> (optional) function() {...} ;</param>
        },
        removePasswords: function (options, callback) {
            ///<summary>Clears the browser's stored passwords.</summary>
            ///<param name='options' type='RemovalOptions'></param> 
            ///<param name='callback' type='function'> (optional) function() {...} ;</param>
        },
        removePluginData: function (options, callback) {
            ///<summary>Clears plugins' data.</summary>
            ///<param name='options' type='RemovalOptions'></param> 
            ///<param name='callback' type='function'> (optional) function() {...} ;</param>
        },
        removeWebSQL: function (options, callback) {
            ///<summary>Clears websites' WebSQL data.</summary>
            ///<param name='options' type='RemovalOptions'></param> 
            ///<param name='callback' type='function'> (optional) function() {...} ;</param>
        },
        settings: function (callback) {
            ///<summary>Reports which types of data are currently selected in the 'Clear browsing data' settings UI. Note: some of the data types included in this API are not available in the settings UI, and some UI settings control more than one data type listed here.</summary>
            ///<param name='callback' type='function'>function(object result) {...} ;</param>
        }
    },
    commands: {
        getAll: function (callback) {
            ///<summary>Returns all the registered extension commands for this extension and their shortcut (if active).</summary>
            ///<param name='callback' type='function'> (optional) function(array of Command commands) {...} ;</param>
        },
        onCommand: {
            addListener: function (callback) {
                ///<summary>Fired when a registered command is activated using a keyboard shortcut.</summary>
                ///<param name='callback' type='function'>function(string command) {...} ;</param>
            }
        }
    },
    contentSettings: {
        clear: function (details, callback) {
            ///<summary>Clear all content setting rules set by this extension.</summary>
            ///<param name='details' type='object'>{scope: (optional enum of /regular/ or /icognito_session_only/)}</param>
            ///<param name='callback' type='function'> (optional) function() {...};</param>
        },
        get: function (details, callback) {
            ///<summary>Gets the current content setting for a given pair of URLs.</summary>
            ///<param name='details' type='object'>{primaryUrl: (string), secondaryUrl: (optional string), resourceIdentifier: (optional ResourceIdentifier), icognito: (optional boolean)}</param>
            ///<param name='callback' type='function'>function(object details) {...};</param>
        },
        set: function (details, callback) {
            ///<summary>Gets the current content setting for a given pair of URLs.</summary>
            ///<param name='details' type='object'>{primaryPattern: (string), secondaryPattern: (optional string), resourceIdentifier: (optional ResourceIdentifier), setting: (any), scope: (optional enum of /regular/ or /icognito_session_only/)}</param>
            ///<param name='callback' type='function'>function() {...};</param>
        },
        getResourceIdentifiers: function (callback) {
            ///<summary></summary>
            ///<param name='callback' type='function'>function(array of ResourceIdentifier resourceIdentifiers) {...};</param>
        },
        cookies: {},
        images: {},
        javascript: {},
        plugins: {},
        popups: {},
        notifications: {}
    },
    contextMenus: {
        create: function (createProperties, callback) {
            ///<summary>Creates a new context menu item. Note that if an error occurs during creation, you may not find out until the creation callback fires (the details will be in chrome.runtime.lastError).</summary>
            ///<param name='createProperties' type='object'>{documentUrlPatterns: (optional arrayofstring), checked: (optional boolean), title: (optional string), contexts: (optional arrayofenumof \\all\\ , \\page\\ , \\frame\\ , \\selection\\ , \\link\\ , \\editable\\ , \\image\\ , \\video\\ , \\audio\\ ,or \\launcher\\ ), enabled: (optional boolean), targetUrlPatterns: (optional arrayofstring), onclick: (optional function), parentId: (optional integerorstring), type: (optional enumof \\normal\\ , \\checkbox\\ , \\radio\\ ,or \\separator\\ ), id: (optional string)}</param> 
            ///<param name='callback' type='function'> (optional) function() {...} ;</param>
        },
        onClicked: {
            addListener: function (callback) {
                ///<summary>Fired when a context menu item is clicked.</summary>
                ///<param name='callback' type='function'>function( OnClickData info, tabs.Tab tab) {...} ;</param>
            }
        },
        remove: function (menuItemId, callback) {
            ///<summary>Removes a context menu item.</summary>
            ///<param name='menuItemId' type='integer or string'>The ID of the context menu item to remove.</param> 
            ///<param name='callback' type='function'> (optional) function() {...} ;</param>
        },
        removeAll: function (callback) {
            ///<summary>Removes all context menu items added by this extension.</summary>
            ///<param name='callback' type='function'> (optional) function() {...} ;</param>
        },
        update: function (id, updateProperties, callback) {
            ///<summary>Updates a previously created context menu item.</summary>
            ///<param name='id' type='integer or string'>The ID of the item to update.</param> 
            ///<param name='updateProperties' type='object'>The properties to update. Accepts the same values as the create function.{documentUrlPatterns: (optional arrayofstring), checked: (optional boolean), title: (optional string), contexts: (optional arrayofenumof \\all\\ , \\page\\ , \\frame\\ , \\selection\\ , \\link\\ , \\editable\\ , \\image\\ , \\video\\ , \\audio\\ ,or \\launcher\\ ), enabled: (optional boolean), targetUrlPatterns: (optional arrayofstring), onclick: (optional function), parentId: (optional integerorstring), type: (optional enumof \\normal\\ , \\checkbox\\ , \\radio\\ ,or \\separator\\ )}</param> 
            ///<param name='callback' type='function'> (optional) function() {...} ;</param>
        }
    },
    cookies: {
        get: function (details, callback) {
            ///<summary>Retrieves information about a single cookie. If more than one cookie of the same name exists for the given URL, the one with the longest path will be returned. For cookies with the same path length, the cookie with the earliest creation time will be returned.</summary>
            ///<param name='details' type='object'>Details to identify the cookie being retrieved.{domain: (optional string), name: (string), url: (string), storeId: (string), value: (optional string), session: (optional boolean), expirationDate: (optional double), path: (optional string), httpOnly: (optional boolean), secure: (optional boolean)}</param> 
            ///<param name='callback' type='function'>function( Cookie cookie) {...} ;</param>
        },
        getAll: function (details, callback) {
            ///<summary>Retrieves all cookies from a single cookie store that match the given information. The cookies returned will be sorted, with those with the longest path first. If multiple cookies have the same path length, those with the earliest creation time will be first.</summary>
            ///<param name='details' type='object'>Information to filter the cookies being retrieved.{domain: (optional string), name: (string), url: (string), storeId: (string), value: (optional string), session: (optional boolean), expirationDate: (optional double), path: (optional string), httpOnly: (optional boolean), secure: (optional boolean)}</param> 
            ///<param name='callback' type='function'>function(array of Cookie cookies) {...} ;</param>
        },
        getAllCookieStores: function (callback) {
            ///<summary>Lists all existing cookie stores.</summary>
            ///<param name='callback' type='function'>function(array of CookieStore cookieStores) {...} ;</param>
        },
        onChanged: {
            addListener: function (callback) {
                ///<summary>Fired when a cookie is set or removed. As a special case, note that updating a cookie's properties is implemented as a two step process: the cookie to be updated is first removed entirely, generating a notification with \cause\ of \overwrite\ . Afterwards, a new cookie is written with the updated values, generating a second notification with \cause\ \explicit\.</summary>
                ///<param name='callback' type='function'>function(object changeInfo) {...} ;</param>
            }
        },
        remove: function (details, callback) {
            ///<summary>Deletes a cookie by name.</summary>
            ///<param name='details' type='object'>Information to identify the cookie to remove.{domain: (optional string), name: (string), url: (string), storeId: (string), value: (optional string), session: (optional boolean), expirationDate: (optional double), path: (optional string), httpOnly: (optional boolean), secure: (optional boolean)}</param> 
            ///<param name='callback' type='function'> (optional) function(object details) {...} ;</param>
        },
        set: function (details, callback) {
            ///<summary>Sets a cookie with the given cookie data; may overwrite equivalent cookies if they exist.</summary>
            ///<param name='details' type='object'>Details about the cookie being set.{domain: (optional string), name: (string), url: (string), storeId: (string), value: (optional string), session: (optional boolean), expirationDate: (optional double), path: (optional string), httpOnly: (optional boolean), secure: (optional boolean)}</param> 
            ///<param name='callback' type='function'> (optional) function( Cookie cookie) {...} ;</param>
        }
    },
    debugger: {
        attach: function (target, requiredVersion, callback) {
            ///<summary>Attaches debugger to the given target.</summary>
            ///<param name='target' type='Debuggee'>Debugging target to which you want to attach.</param> 
            ///<param name='requiredVersion' type='string'>None</param> 
            ///<param name='callback' type='function'> (optional) function() {...} ;</param>
        },
        detach: function (target, callback) {
            ///<summary>Detaches debugger from the given target.</summary>
            ///<param name='target' type='Debuggee'>Debugging target from which you want to detach.</param> 
            ///<param name='callback' type='function'> (optional) function() {...} ;</param>
        },
        getTargets: function (callback) {
            ///<summary>Returns the list of available debug targets.</summary>
            ///<param name='callback' type='function'>function(array of TargetInfo result) {...} ;</param>
        },
        onDetach: {
            addListener: function (callback) {
                ///<summary>Fired when browser terminates debugging session for the tab. This happens when either the tab is being closed or Chrome DevTools is being invoked for the attached tab.</summary>
                ///<param name='callback' type='function'>function( Debuggee source, enum of \target_closed\ , \canceled_by_user\ , or \replaced_with_devtools\ reason) {...} ;</param>
            }
        },
        onEvent: {
            addListener: function (callback) {
                ///<summary>Fired whenever debugging target issues instrumentation event.</summary>
                ///<param name='callback' type='function'>function( Debuggee source, string method, object params) {...} ;</param>
            }
        },
        sendCommand: function (target, method, commandParams, callback) {
            ///<summary>Sends given command to the debugging target.</summary>
            ///<param name='target' type='Debuggee'>Debugging target to which you want to send the command.</param> 
            ///<param name='method' type='string'>None</param> 
            ///<param name='commandParams' type='object'> (optional) JSON object with request parameters. This object must conform to the remote debugging params scheme for given method.</param> 
            ///<param name='callback' type='function'> (optional) function(object result) {...} ;</param>
        }
    },
    devtools: {
        inspectedWindow: {
            eval: function (expression, callback) {
                ///<summary>Evaluates a JavaScript expression in the context of the main frame of the inspected page. The expression must evaluate to a JSON-compliant object, otherwise an exception is thrown.</summary>
                ///<param name='expression' type='string'>An expression to evaluate.</param> 
                ///<param name='callback' type='function'> (optional) function(object result, boolean isException) {...} ;</param>
            },
            getResources: function (callback) {
                ///<summary>Retrieves the list of resources from the inspected page.</summary>
                ///<param name='callback' type='function'>function(array of Resource resources) {...} ;</param>
            },
            onResourceAdded: {
                addListener: function (callback) {
                    ///<summary>Fired when a new resource is added to the inspected page.</summary>
                    ///<param name='callback' type='function'>function( Resource resource) {...} ;</param>
                }
            },
            onResourceContentCommitted: {
                addListener: function (callback) {
                    ///<summary>Fired when a new revision of the resource is committed (e.g. user saves an edited version of the resource in the Developer Tools).</summary>
                    ///<param name='callback' type='function'>function( Resource resource, string content) {...} ;</param>
                }
            },
            reload: function (reloadOptions) {
                ///<summary>Reloads the inspected page.</summary>
                ///<param name='reloadOptions' type='object'> (optional) {userAgent: (optional string), ignoreCache: (optional boolean), injectedScript: (optional string)}</param>
            }
        },
        network: {
            getHAR: function (callback) {
                ///<summary>Returns HAR log that contains all known network requests.</summary>
                ///<param name='callback' type='function'>function(object harLog) {...} ;</param>
            },
            onNavigated: {
                addListener: function (callback) {
                    ///<summary>Fired when the inspected window navigates to a new page.</summary>
                    ///<param name='callback' type='function'>function(string url) {...} ;</param>
                }
            },
            onRequestFinished: {
                addListener: function (callback) {
                    ///<summary>Fired when a network request is finished and all request data are available.</summary>
                    ///<param name='callback' type='function'>function( Request request) {...} ;</param>
                }
            }
        },
        panels: {
            create: function (title, iconPath, pagePath, callback) {
                ///<summary>Creates an extension panel.</summary>
                ///<param name='title' type='string'>Title that is displayed next to the extension icon in the Developer Tools toolbar.</param> 
                ///<param name='iconPath' type='string'>Path of the panel's icon relative to the extension directory.</param> 
                ///<param name='pagePath' type='string'>Path of the panel's HTML page relative to the extension directory.</param> 
                ///<param name='callback' type='function'> (optional) function( ExtensionPanel panel) {...} ;</param>
            },
            setOpenResourceHandler: function (callback) {
                ///<summary>Specifies the function to be called when the user clicks a resource link in the Developer Tools window. To unset the handler, either call the method with no parameters or pass null as the parameter.</summary>
                ///<param name='callback' type='function'> (optional) function( devtools.inspectedWindow.Resource resource) {...} ;</param>
            }
        }
    },
    downloads: {
        acceptDanger: function (downloadId, callback) {
            ///<summary>Prompt the user to accept a dangerous download. Does not automatically accept dangerous downloads. If the download is accepted, then an onChanged event will fire, otherwise nothing will happen. When all the data is fetched into a temporary file and either the download is not dangerous or the danger has been accepted, then the temporary file is renamed to the target filename, the |state| changes to 'complete', and onChanged fires.</summary>
            ///<param name='downloadId' type='integer'>None</param> 
            ///<param name='callback' type='function'> (optional) function() {...} ;</param>
        },
        cancel: function (downloadId, callback) {
            ///<summary>Cancel a download. When callback is run, the download is cancelled, completed, interrupted or doesn't exist anymore.</summary>
            ///<param name='downloadId' type='integer'>The id of the download to cancel.</param> 
            ///<param name='callback' type='function'> (optional) function() {...} ;</param>
        },
        download: function (options, callback) {
            ///<summary>Download a URL. If the URL uses the HTTP[S] protocol, then the request will include all cookies currently set for its hostname. If both filename and saveAs are specified, then the Save As dialog will be displayed, pre-populated with the specified filename . If the download started successfully, callback will be called with the new DownloadItem 's downloadId . If there was an error starting the download, then callback will be called with downloadId=undefined and runtime.lastError will contain a descriptive string. The error strings are not guaranteed to remain backwards compatible between releases. Extensions must not parse it.</summary>
            ///<param name='options' type='object'>What to download and how.{body: (optional string), saveAs: (optional boolean), url: (string), filename: (optional string), headers: (optional arrayofobject), method: (optional enumof \\GET\\ ,or \\POST\\ ), conflictAction: (optional FilenameConflictAction ), size: (optional integer)}</param> 
            ///<param name='callback' type='function'> (optional) function(integer downloadId) {...} ;</param>
        },
        drag: function (downloadId) {
            ///<summary>Initiate dragging the downloaded file to another application. Call in a javascript ondragstart handler.</summary>
            ///<param name='downloadId' type='integer'></param>
        },
        erase: function (query, callback) {
            ///<summary>Erase matching DownloadItem from history without deleting the downloaded file. An onErased event will fire for each DownloadItem that matches query , then callback will be called.</summary>
            ///<param name='query' type='object'>{orderBy: (optional arrayofstring), urlRegex: (optional string), endedBefore: (optional string), totalBytesGreater: (optional integer), danger: (optional DangerType ), totalBytes: (optional integer), paused: (optional boolean), filenameRegex: (optional string), query: (optional arrayofstring), totalBytesLess: (optional integer), id: (optional integer), bytesReceived: (optional integer), exists: (optional boolean), endedAfter: (optional string), filename: (optional string), state: (optional State ), startedAfter: (optional string), mime: (optional string), fileSize: (optional integer), startTime: (optional string), url: (optional string), startedBefore: (optional string), limit: (optional integer), error: (optional InterruptReason ), endTime: (optional string)}</param> 
            ///<param name='callback' type='function'> (optional) function(array of integer erasedIds) {...} ;</param>
        },
        getFileIcon: function (downloadId, options, callback) {
            ///<summary>Retrieve an icon for the specified download. For new downloads, file icons are available after the onCreated event has been received. The image returned by this function while a download is in progress may be different from the image returned after the download is complete. Icon retrieval is done by querying the underlying operating system or toolkit depending on the platform. The icon that is returned will therefore depend on a number of factors including state of the download, platform, registered file types and visual theme. If a file icon cannot be determined, runtime.lastError will contain an error message.</summary>
            ///<param name='downloadId' type='integer'>The identifier for the download.</param> 
            ///<param name='options' type='object'> (optional) {body: (optional string), saveAs: (optional boolean), url: (string), filename: (optional string), headers: (optional arrayofobject), method: (optional enumof \\GET\\ ,or \\POST\\ ), conflictAction: (optional FilenameConflictAction ), size: (optional integer)}</param> 
            ///<param name='callback' type='function'>function(string iconURL) {...} ;</param>
        },
        onChanged: {
            addListener: function (callback) {
                ///<summary>When any of a DownloadItem 's properties except bytesReceived and estimatedEndTime changes, this event fires with the downloadId and an object containing the properties that changed.</summary>
                ///<param name='callback' type='function'>function(object downloadDelta) {...} ;</param>
            }
        },
        onCreated: {
            addListener: function (callback) {
                ///<summary>This event fires with the DownloadItem object when a download begins.</summary>
                ///<param name='callback' type='function'>function( DownloadItem downloadItem) {...} ;</param>
            }
        },
        onDeterminingFilename: {
            addListener: function (callback) {
                ///<summary>During the filename determination process, extensions will be given the opportunity to override the target DownloadItem.filename . Each extension may not register more than one listener for this event. Each listener must call suggest exactly once, either synchronously or asynchronously. If the listener calls suggest asynchronously, then it must return true . If the listener neither calls suggest synchronously nor returns true , then suggest will be called automatically. The DownloadItem will not complete until all listeners have called suggest . Listeners may call suggest without any arguments in order to allow the download to use downloadItem.filename for its filename, or pass a suggestion object to suggest in order to override the target filename. If more than one extension overrides the filename, then the last extension installed whose listener passes a suggestion object to suggest wins. In order to avoid confusion regarding which extension will win, users should not install extensions that may conflict. If the download is initiated by download and the target filename is known before the MIME type and tentative filename have been determined, pass filename to download instead.</summary>
                ///<param name='callback' type='function'>function( DownloadItem downloadItem, function suggest) {...} ;</param>
            }
        },
        onErased: {
            addListener: function (callback) {
                ///<summary>Fires with the downloadId when a download is erased from history.</summary>
                ///<param name='callback' type='function'>function(integer downloadId) {...} ;</param>
            }
        },
        open: function (downloadId) {
            ///<summary>Open the downloaded file now if the DownloadItem is complete; otherwise returns an error through runtime.lastError . Requires the \downloads.open\ permission in addition to the \downloads\ permission. An onChanged event will fire when the item is opened for the first time.</summary>
            ///<param name='downloadId' type='integer'>The identifier for the downloaded file.</param>
        },
        pause: function (downloadId, callback) {
            ///<summary>Pause the download. If the request was successful the download is in a paused state. Otherwise runtime.lastError contains an error message. The request will fail if the download is not active.</summary>
            ///<param name='downloadId' type='integer'>The id of the download to pause.</param> 
            ///<param name='callback' type='function'> (optional) function() {...} ;</param>
        },
        removeFile: function (downloadId, callback) {
            ///<summary>Remove the downloaded file if it exists and the DownloadItem is complete; otherwise return an error through runtime.lastError .</summary>
            ///<param name='downloadId' type='integer'></param> 
            ///<param name='callback' type='function'> (optional) function() {...} ;</param>
        },
        resume: function (downloadId, callback) {
            ///<summary>Resume a paused download. If the request was successful the download is in progress and unpaused. Otherwise runtime.lastError contains an error message. The request will fail if the download is not active.</summary>
            ///<param name='downloadId' type='integer'>The id of the download to resume.</param> 
            ///<param name='callback' type='function'> (optional) function() {...} ;</param>
        },
        search: function (query, callback) {
            ///<summary>Find DownloadItem . Set query to the empty object to get all DownloadItem . To get a specific DownloadItem , set only the id field. To page through a large number of items, set orderBy: ['-startTime'] , set limit to the number of items per page, and set startedAfter to the startTime of the last item from the last page.</summary>
            ///<param name='query' type='object'>{orderBy: (optional arrayofstring), urlRegex: (optional string), endedBefore: (optional string), totalBytesGreater: (optional integer), danger: (optional DangerType ), totalBytes: (optional integer), paused: (optional boolean), filenameRegex: (optional string), query: (optional arrayofstring), totalBytesLess: (optional integer), id: (optional integer), bytesReceived: (optional integer), exists: (optional boolean), endedAfter: (optional string), filename: (optional string), state: (optional State ), startedAfter: (optional string), mime: (optional string), fileSize: (optional integer), startTime: (optional string), url: (optional string), startedBefore: (optional string), limit: (optional integer), error: (optional InterruptReason ), endTime: (optional string)}</param> 
            ///<param name='callback' type='function'>function(array of DownloadItem results) {...} ;</param>
        },
        setShelfEnabled: function (enabled) {
            ///<summary>Enable or disable the gray shelf at the bottom of every window associated with the current browser profile. The shelf will be disabled as long as at least one extension has disabled it. Enabling the shelf while at least one other extension has disabled it will return an error through runtime.lastError . Requires the \downloads.shelf\ permission in addition to the \downloads\ permission.</summary>
            ///<param name='enabled' type='boolean'></param>
        },
        show: function (downloadId) {
            ///<summary>Show the downloaded file in its folder in a file manager.</summary>
            ///<param name='downloadId' type='integer'>The identifier for the downloaded file.</param>
        },
        showDefaultFolder: function () { }
    },
    events: {
        addListener: function (callback) {
            ///<summary>Registers an event listener callback to an event.</summary>
            ///<param name="callback" type="function">function() {...}</param>
        },
        removeListener: function (callback) {
            ///<summary>Deregisters an event listener callback from an event.</summary>
            ///<param name="callback" type="function">function() {...}</param>
        },
        hasListener: function (callback) {
            ///<summary>Tests that a specific event listener callback is registered.</summary>
            ///<param name="callback" type="function">function() {...}</param>
        },
        hasListeners: function () {
            ///<summary>Tests that an event listener callback is registered.</summary>
        },
        addRules: function (rules, callback) {
            ///<summary>Registers rules to handle events.</summary>
            ///<param name="rules" type="array">Rules to be registered. These do not replace previously registered rules.</param>
            ///<param name="callback" type="function">function(array of Rule rules) {...}</param>
        },
        getRules: function (ruleIdentifiers, callback) {
            ///<summary>Returns currently registered rules.</summary>
            ///<param name="ruleIdentifiers" type="array"> (optional) If an array is passed, only rules with identifiers contained in this array are returned.</param>
            ///<param name="callback" type="function">function(array of Rule rules) {...}</param>
        },
        removeRules: function (ruleIdentifiers, callback) {
            ///<summary>Unregisters currently registered rules.</summary>
            ///<param name="ruleIdentifiers" type="array">(optional) Rules to be registered. These do not replace previously registered rules.</param>
            ///<param name="callback" type="function">function() {...}</param>
        }
    },
    extension: {
        getBackgroundPage: function () { },
        getExtensionTabs: function (windowId) {
            ///<summary>Returns an array of the JavaScript 'window' objects for each of the tabs running inside the current extension. If windowId is specified, returns only the 'window' objects of tabs attached to the specified window.</summary>
            ///<param name='windowId' type='integer'> (optional) </param>
        },
        getURL: function (path) {
            ///<summary>Converts a relative path within an extension install directory to a fully-qualified URL.</summary>
            ///<param name='path' type='string'>A path to a resource within an extension expressed relative to its install directory.</param>
        },
        getViews: function (fetchProperties) {
            ///<summary>Returns an array of the JavaScript 'window' objects for each of the pages running inside the current extension.</summary>
            ///<param name='fetchProperties' type='object'> (optional) {windowId: (optional integer), type: (optional enumof \\tab\\ , \\infobar\\ , \\notification\\ ,or \\popup\\ )}</param>
        },
        isAllowedFileSchemeAccess: function (callback) {
            ///<summary>Retrieves the state of the extension's access to the 'file://' scheme (as determined by the user-controlled 'Allow access to File URLs' checkbox.</summary>
            ///<param name='callback' type='function'>function(boolean isAllowedAccess) {...} ;</param>
        },
        isAllowedIncognitoAccess: function (callback) {
            ///<summary>Retrieves the state of the extension's access to Incognito-mode (as determined by the user-controlled 'Allowed in Incognito' checkbox.</summary>
            ///<param name='callback' type='function'>function(boolean isAllowedAccess) {...} ;</param>
        },
        onRequest: {
            addListener: function (callback) {
                ///<summary></summary>
                ///<param name='callback' type='function'>function(any request, runtime.MessageSender sender, function sendResponse) {...} ;</param>
            }
        },
        onRequestExternal: {
            addListener: function (callback) {
                ///<summary></summary>
                ///<param name='callback' type='function'>function(any request, runtime.MessageSender sender, function sendResponse) {...} ;</param>
            }
        },
        sendRequest: function (extensionId, request, responseCallback) {
            ///<summary>Sends a single request to other listeners within the extension. Similar to runtime.connect , but only sends a single request with an optional response. The onRequest event is fired in each page of the extension.</summary>
            ///<param name='extensionId' type='string'> (optional) The extension ID of the extension you want to connect to. If omitted, default is your own extension.</param> 
            ///<param name='request' type='any'></param> 
            ///<param name='responseCallback' type='function'> (optional) </param>
        },
        setUpdateUrlData: function (data) {
            ///<summary>Sets the value of the ap CGI parameter used in the extension's update URL. This value is ignored for extensions that are hosted in the Chrome Extension Gallery.</summary>
            ///<param name='data' type='string'></param>
        }
    },
    fileBrowserHandler: {
        onExecute: {
            addListener: function (callback) {
                ///<summary>Fired when file system action is executed from ChromeOS file browser.</summary>
                ///<param name='callback' type='function'>function(string id, FileHandlerExecuteEventDetails details) {...} ;</param>
            }
        },
        selectFile: function (selectionParams, callback) {
            ///<summary>Prompts user to select file path under which file should be saved. When the file is selected, file access permission required to use the file (read, write and create) are granted to the caller. The file will not actually get created during the function call, so function caller must ensure its existence before using it. The function has to be invoked with a user gesture.</summary>
            ///<param name='selectionParams' type='object'>Parameters that will be used while selecting the file.{allowedFileExtensions: (optional arrayofstring), suggestedName: (string)}</param> 
            ///<param name='callback' type='function'>function(object result) {...} ;</param>
        }
    },
    fontSettings: {
        clearDefaultFixedFontSize: function (details, callback) {
            ///<summary>Clears the default fixed font size set by this extension, if any.</summary>
            ///<param name='details' type='object'> (optional) This parameter is currently unused.{levelOfControl: ( LevelOfControl ), pixelSize: (integer), fontId: (string), genericFamily: ( GenericFamily ), script: (optional ScriptCode )}</param> 
            ///<param name='callback' type='function'> (optional) function() {...} ;</param>
        },
        clearDefaultFontSize: function (details, callback) {
            ///<summary>Clears the default font size set by this extension, if any.</summary>
            ///<param name='details' type='object'> (optional) This parameter is currently unused.{levelOfControl: ( LevelOfControl ), pixelSize: (integer), fontId: (string), genericFamily: ( GenericFamily ), script: (optional ScriptCode )}</param> 
            ///<param name='callback' type='function'> (optional) function() {...} ;</param>
        },
        clearFont: function (details, callback) {
            ///<summary>Clears the font set by this extension, if any.</summary>
            ///<param name='details' type='object'>{levelOfControl: ( LevelOfControl ), pixelSize: (integer), fontId: (string), genericFamily: ( GenericFamily ), script: (optional ScriptCode )}</param> 
            ///<param name='callback' type='function'> (optional) function() {...} ;</param>
        },
        clearMinimumFontSize: function (details, callback) {
            ///<summary>Clears the minimum font size set by this extension, if any.</summary>
            ///<param name='details' type='object'> (optional) This parameter is currently unused.{levelOfControl: ( LevelOfControl ), pixelSize: (integer), fontId: (string), genericFamily: ( GenericFamily ), script: (optional ScriptCode )}</param> 
            ///<param name='callback' type='function'> (optional) function() {...} ;</param>
        },
        getDefaultFixedFontSize: function (details, callback) {
            ///<summary>Gets the default size for fixed width fonts.</summary>
            ///<param name='details' type='object'> (optional) This parameter is currently unused.{levelOfControl: ( LevelOfControl ), pixelSize: (integer), fontId: (string), genericFamily: ( GenericFamily ), script: (optional ScriptCode )}</param> 
            ///<param name='callback' type='function'> (optional) function(object details) {...} ;</param>
        },
        getDefaultFontSize: function (details, callback) {
            ///<summary>Gets the default font size.</summary>
            ///<param name='details' type='object'> (optional) This parameter is currently unused.{levelOfControl: ( LevelOfControl ), pixelSize: (integer), fontId: (string), genericFamily: ( GenericFamily ), script: (optional ScriptCode )}</param> 
            ///<param name='callback' type='function'> (optional) function(object details) {...} ;</param>
        },
        getFont: function (details, callback) {
            ///<summary>Gets the font for a given script and generic font family.</summary>
            ///<param name='details' type='object'>{levelOfControl: ( LevelOfControl ), pixelSize: (integer), fontId: (string), genericFamily: ( GenericFamily ), script: (optional ScriptCode )}</param> 
            ///<param name='callback' type='function'> (optional) function(object details) {...} ;</param>
        },
        getFontList: function (callback) {
            ///<summary>Gets a list of fonts on the system.</summary>
            ///<param name='callback' type='function'>function(array of FontName results) {...} ;</param>
        },
        getMinimumFontSize: function (details, callback) {
            ///<summary>Gets the minimum font size.</summary>
            ///<param name='details' type='object'> (optional) This parameter is currently unused.{levelOfControl: ( LevelOfControl ), pixelSize: (integer), fontId: (string), genericFamily: ( GenericFamily ), script: (optional ScriptCode )}</param> 
            ///<param name='callback' type='function'> (optional) function(object details) {...} ;</param>
        },
        onDefaultFixedFontSizeChanged: {
            addListener: function (callback) {
                ///<summary>Fired when the default fixed font size setting changes.</summary>
                ///<param name='callback' type='function'>function(object details) {...} ;</param>
            }
        },
        onDefaultFontSizeChanged: {
            addListener: function (callback) {
                ///<summary>Fired when the default font size setting changes.</summary>
                ///<param name='callback' type='function'>function(object details) {...} ;</param>
            }
        },
        onFontChanged: {
            addListener: function (callback) {
                ///<summary>Fired when a font setting changes.</summary>
                ///<param name='callback' type='function'>function(object details) {...} ;</param>
            }
        },
        onMinimumFontSizeChanged: {
            addListener: function (callback) {
                ///<summary>Fired when the minimum font size setting changes.</summary>
                ///<param name='callback' type='function'>function(object details) {...} ;</param>
            }
        },
        setDefaultFixedFontSize: function (details, callback) {
            ///<summary>Sets the default size for fixed width fonts.</summary>
            ///<param name='details' type='object'>{levelOfControl: ( LevelOfControl ), pixelSize: (integer), fontId: (string), genericFamily: ( GenericFamily ), script: (optional ScriptCode )}</param> 
            ///<param name='callback' type='function'> (optional) function() {...} ;</param>
        },
        setDefaultFontSize: function (details, callback) {
            ///<summary>Sets the default font size.</summary>
            ///<param name='details' type='object'>{levelOfControl: ( LevelOfControl ), pixelSize: (integer), fontId: (string), genericFamily: ( GenericFamily ), script: (optional ScriptCode )}</param> 
            ///<param name='callback' type='function'> (optional) function() {...} ;</param>
        },
        setFont: function (details, callback) {
            ///<summary>Sets the font for a given script and generic font family.</summary>
            ///<param name='details' type='object'>{levelOfControl: ( LevelOfControl ), pixelSize: (integer), fontId: (string), genericFamily: ( GenericFamily ), script: (optional ScriptCode )}</param> 
            ///<param name='callback' type='function'> (optional) function() {...} ;</param>
        },
        setMinimumFontSize: function (details, callback) {
            ///<summary>Sets the minimum font size.</summary>
            ///<param name='details' type='object'>{levelOfControl: ( LevelOfControl ), pixelSize: (integer), fontId: (string), genericFamily: ( GenericFamily ), script: (optional ScriptCode )}</param> 
            ///<param name='callback' type='function'> (optional) function() {...} ;</param>
        }
    },
    history: {
        addUrl: function (details, callback) {
            ///<summary>Adds a URL to the history at the current time with a transition type of \link\.</summary>
            ///<param name='details' type='object'>{url: (string)}</param> 
            ///<param name='callback' type='function'> (optional) function() {...} ;</param>
        },
        deleteAll: function (callback) {
            ///<summary>Deletes all items from the history.</summary>
            ///<param name='callback' type='function'>function() {...} ;</param>
        },
        deleteRange: function (range, callback) {
            ///<summary>Removes all items within the specified date range from the history. Pages will not be removed from the history unless all visits fall within the range.</summary>
            ///<param name='range' type='object'>{endTime: (double), startTime: (double)}</param> 
            ///<param name='callback' type='function'>function() {...} ;</param>
        },
        deleteUrl: function (details, callback) {
            ///<summary>Removes all occurrences of the given URL from the history.</summary>
            ///<param name='details' type='object'>{url: (string)}</param> 
            ///<param name='callback' type='function'> (optional) function() {...} ;</param>
        },
        getVisits: function (details, callback) {
            ///<summary>Retrieves information about visits to a URL.</summary>
            ///<param name='details' type='object'>{url: (string)}</param> 
            ///<param name='callback' type='function'>function(array of VisitItem results) {...} ;</param>
        },
        onVisitRemoved: {
            addListener: function (callback) {
                ///<summary>Fired when one or more URLs are removed from the history service. When all visits have been removed the URL is purged from history.</summary>
                ///<param name='callback' type='function'>function(object removed) {...} ;</param>
            }
        },
        onVisited: {
            addListener: function (callback) {
                ///<summary>Fired when a URL is visited, providing the HistoryItem data for that URL. This event fires before the page has loaded.</summary>
                ///<param name='callback' type='function'>function( HistoryItem result) {...} ;</param>
            }
        },
        search: function (query, callback) {
            ///<summary>Searches the history for the last visit time of each page matching the query.</summary>
            ///<param name='query' type='object'>{text: (string), endTime: (optional double), maxResults: (optional integer), startTime: (optional double)}</param> 
            ///<param name='callback' type='function'>function(array of HistoryItem results) {...} ;</param>
        }
    },
    i18n: {
        getAcceptLanguages: function (callback) {
            ///<summary>Gets the accept-languages of the browser. This is different from the locale used by the browser; to get the locale, use window.navigator.language .</summary>
            ///<param name='callback' type='function'>function(array of string languages) {...} ;</param>
        },
        getMessage: function (messageName, substitutions) {
            ///<summary>Gets the localized string for the specified message. If the message is missing, this method returns an empty string (''). If the format of the getMessage() call is wrong \u2014 for example, messageName is not a string or the substitutions array has more than 9 elements \u2014 this method returns undefined .</summary>
            ///<param name='messageName' type='string'>None</param> 
            ///<param name='substitutions' type='any'> (optional) Up to 9 substitution strings, if the message requires any.</param>
        }
    },
    identity: {
        getAuthToken: function (details, callback) {
            ///<summary>Gets an OAuth2 access token using the client ID and scopes specified in the oauth2 section of manifest.json . The Identity API caches access tokens in memory, so it's ok to call getAuthToken any time a token is required. The token cache automatically handles expiration.</summary>
            ///<param name='details' type='object'> (optional) Token options.{url: (string), token: (string), interactive: (optional boolean)}</param> 
            ///<param name='callback' type='function'>function(string token) {...} ;</param>
        },
        getRedirectURL: function (path) {
            ///<summary>Generates a redirect URL to be used in |launchWebAuthFlow|. The generated URLs match the pattern https://<app-id>.chromiumapp.org/* .</summary>
            ///<param name='path' type='string'> (optional) The path appended to the end of the generated URL.</param>
        },
        launchWebAuthFlow: function (details, callback) {
            ///<summary>Starts an auth flow at the specified URL. This method enables auth flows with non-Google identity providers by launching a web view and navigating it to the first URL in the provider's auth flow. When the provider redirects to a URL matching the pattern https://<app-id>.chromiumapp.org/* , the window will close, and the final redirect URL will be passed to the callback function.</summary>
            ///<param name='details' type='object'>WebAuth flow options.{url: (string), token: (string), interactive: (optional boolean)}</param> 
            ///<param name='callback' type='function'>function(string responseUrl) {...} ;</param>
        },
        onSignInChanged: {
            addListener: function (callback) {
                ///<summary>Fired when signin state changes for an account on the user's profile.</summary>
                ///<param name='callback' type='function'>function(object account, boolean signedIn) {...} ;</param>
            }
        },
        removeCachedAuthToken: function (details, callback) {
            ///<summary>Removes an OAuth2 access token from the Identity API's token cache. If an access token is discovered to be invalid, it should be passed to removeCachedAuthToken to remove it from the cache. The app may then retrieve a fresh token with getAuthToken .</summary>
            ///<param name='details' type='object'>Token information.{url: (string), token: (string), interactive: (optional boolean)}</param> 
            ///<param name='callback' type='function'>function() {...} ;</param>
        }
    },
    idle: {
        onStateChanged: {
            addListener: function (callback) {
                ///<summary>Fired when the system changes to an active, idle or locked state. The event fires with \locked\ if the screen is locked or the screensaver activates, \idle\ if the system is unlocked and the user has not generated any input for a specified number of seconds, and \active\ when the user generates input on an idle system.</summary>
                ///<param name='callback' type='function'>function(enum of \active\ , \idle\ , or \locked\ newState) {...} ;</param>
            }
        },
        queryState: function (detectionIntervalInSeconds, callback) {
            ///<summary>Returns \locked\ if the system is locked, \idle\ if the user has not generated any input for a specified number of seconds, or \active\ otherwise.</summary>
            ///<param name='detectionIntervalInSeconds' type='integer'>The system is considered idle if detectionIntervalInSeconds seconds have elapsed since the last user input detected.</param> 
            ///<param name='callback' type='function'>function(enum of \active\ , \idle\ , or \locked\ newState) {...} ;</param>
        },
        setDetectionInterval: function (intervalInSeconds) {
            ///<summary>Sets the interval, in seconds, used to determine when the system is in an idle state for onStateChanged events. The default interval is 60 seconds.</summary>
            ///<param name='intervalInSeconds' type='integer'>Threshold, in seconds, used to determine when the system is in an idle state.</param>
        }
    },
    input: {
        ime: {
            clearComposition: function (parameters, callback) {
                ///<summary>Clear the current composition. If this extension does not own the active IME, this fails.</summary>
                ///<param name='parameters' type='object'>{contextID: (integer), text: (string), segments: (optional arrayofobject), offset: (integer), properties: (object), cursor: (integer), length: (integer), candidateID: (integer), selectionStart: (optional integer), selectionEnd: (optional integer), items: (arrayof MenuItem ), candidates: (arrayofobject), engineID: (string)}</param> 
                ///<param name='callback' type='function'> (optional) function(boolean success) {...} ;</param>
            },
            commitText: function (parameters, callback) {
                ///<summary>Commits the provided text to the current input.</summary>
                ///<param name='parameters' type='object'>{contextID: (integer), text: (string), segments: (optional arrayofobject), offset: (integer), properties: (object), cursor: (integer), length: (integer), candidateID: (integer), selectionStart: (optional integer), selectionEnd: (optional integer), items: (arrayof MenuItem ), candidates: (arrayofobject), engineID: (string)}</param> 
                ///<param name='callback' type='function'> (optional) function(boolean success) {...} ;</param>
            },
            deleteSurroundingText: function (parameters, callback) {
                ///<summary>Deletes the text around the caret.</summary>
                ///<param name='parameters' type='object'>{contextID: (integer), text: (string), segments: (optional arrayofobject), offset: (integer), properties: (object), cursor: (integer), length: (integer), candidateID: (integer), selectionStart: (optional integer), selectionEnd: (optional integer), items: (arrayof MenuItem ), candidates: (arrayofobject), engineID: (string)}</param> 
                ///<param name='callback' type='function'> (optional) function() {...} ;</param>
            },
            keyEventHandled: function (requestId, response) {
                ///<summary>Indicates that the key event received by onKeyEvent is handled. This should only be called if the onKeyEvent listener is asynchronous.</summary>
                ///<param name='requestId' type='string'>Request id of the event that was handled.  This should come from keyEvent.requestId</param> 
                ///<param name='response' type='boolean'>True if the keystroke was handled, false if not</param>
            },
            onActivate: {
                addListener: function (callback) {
                    ///<summary>This event is sent when an IME is activated. It signals that the IME will be receiving onKeyPress events.</summary>
                    ///<param name='callback' type='function'>function(string engineID) {...} ;</param>
                }
            },
            onBlur: {
                addListener: function (callback) {
                    ///<summary>This event is sent when focus leaves a text box. It is sent to all extensions that are listening to this event, and enabled by the user.</summary>
                    ///<param name='callback' type='function'>function(integer contextID) {...} ;</param>
                }
            },
            onCandidateClicked: {
                addListener: function (callback) {
                    ///<summary>This event is sent if this extension owns the active IME.</summary>
                    ///<param name='callback' type='function'>function(string engineID, integer candidateID, enum of \left\ , \middle\ , or \right\ button) {...} ;</param>
                }
            },
            onDeactivated: {
                addListener: function (callback) {
                    ///<summary>This event is sent when an IME is deactivated. It signals that the IME will no longer be receiving onKeyPress events.</summary>
                    ///<param name='callback' type='function'>function(string engineID) {...} ;</param>
                }
            },
            onFocus: {
                addListener: function (callback) {
                    ///<summary>This event is sent when focus enters a text box. It is sent to all extensions that are listening to this event, and enabled by the user.</summary>
                    ///<param name='callback' type='function'>function( InputContext context) {...} ;</param>
                }
            },
            onInputContextUpdate: {
                addListener: function (callback) {
                    ///<summary>This event is sent when the properties of the current InputContext change, such as the the type. It is sent to all extensions that are listening to this event, and enabled by the user.</summary>
                    ///<param name='callback' type='function'>function( InputContext context) {...} ;</param>
                }
            },
            onKeyEvent: {
                addListener: function (callback) {
                    ///<summary>This event is sent if this extension owns the active IME.</summary>
                    ///<param name='callback' type='function'>function(string engineID, KeyboardEvent keyData) {...} ;</param>
                }
            },
            onMenuItemActivated: {
                addListener: function (callback) {
                    ///<summary>Called when the user selects a menu item</summary>
                    ///<param name='callback' type='function'>function(string engineID, string name) {...} ;</param>
                }
            },
            onReset: {
                addListener: function (callback) {
                    ///<summary>This event is sent when chrome terminates ongoing text input session.</summary>
                    ///<param name='callback' type='function'>function(string engineID) {...} ;</param>
                }
            },
            onSurroundingTextChanged: {
                addListener: function (callback) {
                    ///<summary>Called when the editable string around caret is changed or when the caret position is moved. The text length is limited to 100 characters for each back and forth direction.</summary>
                    ///<param name='callback' type='function'>function(string engineID, object surroundingInfo) {...} ;</param>
                }
            },
            setCandidateWindowProperties: function (parameters, callback) {
                ///<summary>Sets the properties of the candidate window. This fails if the extension doesn\u2019t own the active IME</summary>
                ///<param name='parameters' type='object'>{contextID: (integer), text: (string), segments: (optional arrayofobject), offset: (integer), properties: (object), cursor: (integer), length: (integer), candidateID: (integer), selectionStart: (optional integer), selectionEnd: (optional integer), items: (arrayof MenuItem ), candidates: (arrayofobject), engineID: (string)}</param> 
                ///<param name='callback' type='function'> (optional) function(boolean success) {...} ;</param>
            },
            setCandidates: function (parameters, callback) {
                ///<summary>Sets the current candidate list. This fails if this extension doesn\u2019t own the active IME</summary>
                ///<param name='parameters' type='object'>{contextID: (integer), text: (string), segments: (optional arrayofobject), offset: (integer), properties: (object), cursor: (integer), length: (integer), candidateID: (integer), selectionStart: (optional integer), selectionEnd: (optional integer), items: (arrayof MenuItem ), candidates: (arrayofobject), engineID: (string)}</param> 
                ///<param name='callback' type='function'> (optional) function(boolean success) {...} ;</param>
            },
            setComposition: function (parameters, callback) {
                ///<summary>Set the current composition. If this extension does not own the active IME, this fails.</summary>
                ///<param name='parameters' type='object'>{contextID: (integer), text: (string), segments: (optional arrayofobject), offset: (integer), properties: (object), cursor: (integer), length: (integer), candidateID: (integer), selectionStart: (optional integer), selectionEnd: (optional integer), items: (arrayof MenuItem ), candidates: (arrayofobject), engineID: (string)}</param> 
                ///<param name='callback' type='function'> (optional) function(boolean success) {...} ;</param>
            },
            setCursorPosition: function (parameters, callback) {
                ///<summary>Set the position of the cursor in the candidate window. This is a no-op if this extension does not own the active IME.</summary>
                ///<param name='parameters' type='object'>{contextID: (integer), text: (string), segments: (optional arrayofobject), offset: (integer), properties: (object), cursor: (integer), length: (integer), candidateID: (integer), selectionStart: (optional integer), selectionEnd: (optional integer), items: (arrayof MenuItem ), candidates: (arrayofobject), engineID: (string)}</param> 
                ///<param name='callback' type='function'> (optional) function(boolean success) {...} ;</param>
            },
            setMenuItems: function (parameters, callback) {
                ///<summary>Adds the provided menu items to the language menu when this IME is active.</summary>
                ///<param name='parameters' type='object'>{contextID: (integer), text: (string), segments: (optional arrayofobject), offset: (integer), properties: (object), cursor: (integer), length: (integer), candidateID: (integer), selectionStart: (optional integer), selectionEnd: (optional integer), items: (arrayof MenuItem ), candidates: (arrayofobject), engineID: (string)}</param> 
                ///<param name='callback' type='function'> (optional) function() {...} ;</param>
            },
            updateMenuItems: function (parameters, callback) {
                ///<summary>Updates the state of the MenuItems specified</summary>
                ///<param name='parameters' type='object'>{contextID: (integer), text: (string), segments: (optional arrayofobject), offset: (integer), properties: (object), cursor: (integer), length: (integer), candidateID: (integer), selectionStart: (optional integer), selectionEnd: (optional integer), items: (arrayof MenuItem ), candidates: (arrayofobject), engineID: (string)}</param> 
                ///<param name='callback' type='function'> (optional) function() {...} ;</param>
            }
        }
    },
    management: {
        get: function (id, callback) {
            ///<summary>Returns information about the installed extension, app, or theme that has the given ID.</summary>
            ///<param name='id' type='string'>None</param> 
            ///<param name='callback' type='function'> (optional) function( ExtensionInfo result) {...} ;</param>
        },
        getAll: function (callback) {
            ///<summary>Returns a list of information about installed extensions and apps.</summary>
            ///<param name='callback' type='function'> (optional) function(array of ExtensionInfo result) {...} ;</param>
        },
        getPermissionWarningsById: function (id, callback) {
            ///<summary>Returns a list of permission warnings for the given extension id.</summary>
            ///<param name='id' type='string'>The ID of an already installed extension.</param> 
            ///<param name='callback' type='function'> (optional) function(array of string permissionWarnings) {...} ;</param>
        },
        getPermissionWarningsByManifest: function (manifestStr, callback) {
            ///<summary>Returns a list of permission warnings for the given extension manifest string. Note: This function can be used without requesting the 'management' permission in the manifest.</summary>
            ///<param name='manifestStr' type='string'>Extension manifest JSON string.</param> 
            ///<param name='callback' type='function'> (optional) function(array of string permissionWarnings) {...} ;</param>
        },
        launchApp: function (id, callback) {
            ///<summary>Launches an application.</summary>
            ///<param name='id' type='string'>The extension id of the application.</param> 
            ///<param name='callback' type='function'> (optional) function() {...} ;</param>
        },
        onDisabled: {
            addListener: function (callback) {
                ///<summary>Fired when an app or extension has been disabled.</summary>
                ///<param name='callback' type='function'>function( ExtensionInfo info) {...} ;</param>
            }
        },
        onEnabled: {
            addListener: function (callback) {
                ///<summary>Fired when an app or extension has been enabled.</summary>
                ///<param name='callback' type='function'>function( ExtensionInfo info) {...} ;</param>
            }
        },
        onInstalled: {
            addListener: function (callback) {
                ///<summary>Fired when an app or extension has been installed.</summary>
                ///<param name='callback' type='function'>function( ExtensionInfo info) {...} ;</param>
            }
        },
        onUninstalled: {
            addListener: function (callback) {
                ///<summary>Fired when an app or extension has been uninstalled.</summary>
                ///<param name='callback' type='function'>function(string id) {...} ;</param>
            }
        },
        setEnabled: function (id, enabled, callback) {
            ///<summary>Enables or disables an app or extension.</summary>
            ///<param name='id' type='string'>None</param> 
            ///<param name='enabled' type='boolean'>Whether this item should be enabled or disabled.</param> 
            ///<param name='callback' type='function'> (optional) function() {...} ;</param>
        },
        uninstall: function (id, options, callback) {
            ///<summary>Uninstalls a currently installed app or extension.</summary>
            ///<param name='id' type='string'>None</param> 
            ///<param name='options' type='object'> (optional) {showConfirmDialog: (optional boolean)}</param> 
            ///<param name='callback' type='function'> (optional) function() {...} ;</param>
        },
        uninstallSelf: function (options, callback) {
            ///<summary>Uninstalls the calling extension. Note: This function can be used without requesting the 'management' permission in the manifest.</summary>
            ///<param name='options' type='object'> (optional) {showConfirmDialog: (optional boolean)}</param> 
            ///<param name='callback' type='function'> (optional) function() {...} ;</param>
        }
    },
    notifications: {
        clear: function (notificationId, callback) {
            ///<summary>Clears the specified notification.</summary>
            ///<param name='notificationId' type='string'>None</param> 
            ///<param name='callback' type='function'>function(boolean wasCleared) {...} ;</param>
        },
        create: function (notificationId, options, callback) {
            ///<summary>Creates and displays a notification.</summary>
            ///<param name='notificationId' type='string'>Identifier of the notification. If it is empty, this method generates an id. If it matches an existing notification, this method first clears that notification before proceeding with the create operation.</param> 
            ///<param name='options' type='NotificationOptions'>Contents of the notification.</param> 
            ///<param name='callback' type='function'>function(string notificationId) {...} ;</param>
        },
        getAll: function (callback) {
            ///<summary>Retrieves all the notifications.</summary>
            ///<param name='callback' type='function'>function(object notifications) {...} ;</param>
        },
        getPermissionLevel: function (callback) {
            ///<summary>Retrieves whether the user has enabled notifications from this app or extension.</summary>
            ///<param name='callback' type='function'>function( PermissionLevel level) {...} ;</param>
        },
        onButtonClicked: {
            addListener: function (callback) {
                ///<summary>The user pressed a button in the notification.</summary>
                ///<param name='callback' type='function'>function(string notificationId, integer buttonIndex) {...} ;</param>
            }
        },
        onClicked: {
            addListener: function (callback) {
                ///<summary>The user clicked in a non-button area of the notification.</summary>
                ///<param name='callback' type='function'>function(string notificationId) {...} ;</param>
            }
        },
        onClosed: {
            addListener: function (callback) {
                ///<summary>The notification closed, either by the system or by user action.</summary>
                ///<param name='callback' type='function'>function(string notificationId, boolean byUser) {...} ;</param>
            }
        },
        onPermissionLevelChanged: {
            addListener: function (callback) {
                ///<summary>The user changes the permission level.</summary>
                ///<param name='callback' type='function'>function( PermissionLevel level) {...} ;</param>
            }
        },
        onShowSettings: {
            addListener: function (callback) {
                ///<summary>The user clicked on a link for the app's notification settings.</summary>
                ///<param name='callback' type='function'>function() {...} ;</param>
            }
        },
        update: function (notificationId, options, callback) {
            ///<summary>Updates an existing notification.</summary>
            ///<param name='notificationId' type='string'>None</param> 
            ///<param name='options' type='NotificationOptions'>Contents of the notification to update to.</param> 
            ///<param name='callback' type='function'>function(boolean wasUpdated) {...} ;</param>
        }
    },
    omnibox: {
        onInputCancelled: {
            addListener: function (callback) {
                ///<summary>User has ended the keyword input session without accepting the input.</summary>
                ///<param name='callback' type='function'>function() {...} ;</param>
            }
        },
        onInputChanged: {
            addListener: function (callback) {
                ///<summary>User has changed what is typed into the omnibox.</summary>
                ///<param name='callback' type='function'>function(string text, function suggest) {...} ;</param>
            }
        },
        onInputEntered: {
            addListener: function (callback) {
                ///<summary>User has accepted what is typed into the omnibox.</summary>
                ///<param name='callback' type='function'>function(string text, enum of \currentTab\ , \newForegroundTab\ , or \newBackgroundTab\ disposition) {...} ;</param>
            }
        },
        onInputStarted: {
            addListener: function (callback) {
                ///<summary>User has started a keyword input session by typing the extension's keyword. This is guaranteed to be sent exactly once per input session, and before any onInputChanged events.</summary>
                ///<param name='callback' type='function'>function() {...} ;</param>
            }
        },
        setDefaultSuggestion: function (suggestion) {
            ///<summary>Sets the description and styling for the default suggestion. The default suggestion is the text that is displayed in the first suggestion row underneath the URL bar.</summary>
            ///<param name='suggestion' type='object'>A partial SuggestResult object, without the 'content' parameter.{description: (string)}</param>
        }
    },
    pageAction: {
        getPopup: function (details, callback) {
            ///<summary>Gets the html document set as the popup for this page action.</summary>
            ///<param name='details' type='object'>{popup: (string), iconIndex: (optional integer), imageData: (optional ImageDataType orobject), title: (string), tabId: (integer), path: (optional stringorobject)}</param> 
            ///<param name='callback' type='function'>function(string result) {...} ;</param>
        },
        getTitle: function (details, callback) {
            ///<summary>Gets the title of the page action.</summary>
            ///<param name='details' type='object'>{popup: (string), iconIndex: (optional integer), imageData: (optional ImageDataType orobject), title: (string), tabId: (integer), path: (optional stringorobject)}</param> 
            ///<param name='callback' type='function'>function(string result) {...} ;</param>
        },
        hide: function (tabId) {
            ///<summary>Hides the page action.</summary>
            ///<param name='tabId' type='integer'>The id of the tab for which you want to modify the page action.</param>
        },
        onClicked: {
            addListener: function (callback) {
                ///<summary>Fired when a page action icon is clicked. This event will not fire if the page action has a popup.</summary>
                ///<param name='callback' type='function'>function( tabs.Tab tab) {...} ;</param>
            }
        },
        setIcon: function (details, callback) {
            ///<summary>Sets the icon for the page action. The icon can be specified either as the path to an image file or as the pixel data from a canvas element, or as dictionary of either one of those. Either the path or the imageData property must be specified.</summary>
            ///<param name='details' type='object'>{popup: (string), iconIndex: (optional integer), imageData: (optional ImageDataType orobject), title: (string), tabId: (integer), path: (optional stringorobject)}</param> 
            ///<param name='callback' type='function'> (optional) function() {...} ;</param>
        },
        setPopup: function (details) {
            ///<summary>Sets the html document to be opened as a popup when the user clicks on the page action's icon.</summary>
            ///<param name='details' type='object'>{popup: (string), iconIndex: (optional integer), imageData: (optional ImageDataType orobject), title: (string), tabId: (integer), path: (optional stringorobject)}</param>
        },
        setTitle: function (details) {
            ///<summary>Sets the title of the page action. This is displayed in a tooltip over the page action.</summary>
            ///<param name='details' type='object'>{popup: (string), iconIndex: (optional integer), imageData: (optional ImageDataType orobject), title: (string), tabId: (integer), path: (optional stringorobject)}</param>
        },
        show: function (tabId) {
            ///<summary>Shows the page action. The page action is shown whenever the tab is selected.</summary>
            ///<param name='tabId' type='integer'>The id of the tab for which you want to modify the page action.</param>
        }
    },
    pageCapture: {
        saveAsMHTML: function (details, callback) {
            ///<summary>Saves the content of the tab with given id as MHTML.</summary>
            ///<param name='details' type='object'>{tabId: (integer)}</param> 
            ///<param name='callback' type='function'>function(binary mhtmlData) {...} ;</param>
        }
    },
    permissions: {
        contains: function (permissions, callback) {
            ///<summary>Checks if the extension has the specified permissions.</summary>
            ///<param name='permissions' type='Permissions'></param> 
            ///<param name='callback' type='function'>function(boolean result) {...} ;</param>
        },
        getAll: function (callback) {
            ///<summary>Gets the extension's current set of permissions.</summary>
            ///<param name='callback' type='function'>function( Permissions permissions) {...} ;</param>
        },
        onAdded: {
            addListener: function (callback) {
                ///<summary>Fired when the extension acquires new permissions.</summary>
                ///<param name='callback' type='function'>function( Permissions permissions) {...} ;</param>
            }
        },
        onRemoved: {
            addListener: function (callback) {
                ///<summary>Fired when access to permissions has been removed from the extension.</summary>
                ///<param name='callback' type='function'>function( Permissions permissions) {...} ;</param>
            }
        },
        remove: function (permissions, callback) {
            ///<summary>Removes access to the specified permissions. If there are any problems removing the permissions, runtime.lastError will be set.</summary>
            ///<param name='permissions' type='Permissions'></param> 
            ///<param name='callback' type='function'> (optional) function(boolean removed) {...} ;</param>
        },
        request: function (permissions, callback) {
            ///<summary>Requests access to the specified permissions. These permissions must be defined in the optional_permissions field of the manifest. If there are any problems requesting the permissions, runtime.lastError will be set.</summary>
            ///<param name='permissions' type='Permissions'></param> 
            ///<param name='callback' type='function'> (optional) function(boolean granted) {...} ;</param>
        }
    },
    power: {
        releaseKeepAwake: function () { },
        requestKeepAwake: function (level) {
            ///<summary>Requests that power management be temporarily disabled. |level| describes the degree to which power management should be disabled. If a request previously made by the same app is still active, it will be replaced by the new request.</summary>
            ///<param name='level' type='Level'></param>
        }
    },
    privacy: {
        network: {},
        services: {},
        websites: {}
    },
    proxy: {
        settings: {},
        onProxyError: {
            addListener: function (callback) {
                ///<summary>Notifies about proxy errors.</summary>
                ///<param name='callback' type='function'>function(object details) {...} ;</param>
            }
        }
    },
    pushMessaging: {
        getChannelId: function (interactive, callback) {
            ///<summary>Retrieves the channel ID associated with this app or extension. Typically an app or extension will want to send this value to its application server so the server can use it to trigger push messages back to the app or extension. If the interactive flag is set, we will ask the user to log in when they are not already logged in.</summary>
            ///<param name='interactive' type='boolean'> (optional) </param> 
            ///<param name='callback' type='function'>function(object channelId) {...} ;</param>
        },
        onMessage: {
            addListener: function (callback) {
                ///<summary>Fired when a push message has been received.</summary>
                ///<param name='callback' type='function'>function(object message) {...} ;</param>
            }
        }
    },
    runtime: {
        connect: function (extensionId, connectInfo) {
            ///<summary>Attempts to connect to other listeners within the extension/app (such as the background page), or other extensions/apps. This is useful for content scripts connecting to their extension processes. Note that this does not connect to any listeners in a content script. Extensions may connect to content scripts embedded in tabs via tabs.connect .</summary>
            ///<param name='extensionId' type='string'> (optional) The ID of the extension/app you want to connect to. If omitted, default is your own extension.</param> 
            ///<param name='connectInfo' type='object'> (optional) {includeTlsChannelId: (optional boolean), name: (optional string)}</param>
        },
        connectNative: function (application) {
            ///<summary>Connects to a native application in the host machine.</summary>
            ///<param name='application' type='string'>The name of the registered application to connect to.</param>
        },
        getBackgroundPage: function (callback) {
            ///<summary>Retrieves the JavaScript 'window' object for the background page running inside the current extension/app. If the background page is an event page, the system will ensure it is loaded before calling the callback. If there is no background page, an error is set.</summary>
            ///<param name='callback' type='function'>function(window backgroundPage) {...} ;</param>
        },
        getManifest: function () { },
        getPackageDirectoryEntry: function (callback) {
            ///<summary>Returns a DirectoryEntry for the package directory.</summary>
            ///<param name='callback' type='function'>function(directoryentry directoryEntry) {...} ;</param>
        },
        getPlatformInfo: function (callback) {
            ///<summary>Returns information about the current platform.</summary>
            ///<param name='callback' type='function'>function(object platformInfo) {...} ;</param>
        },
        getURL: function (path) {
            ///<summary>Converts a relative path within an app/extension install directory to a fully-qualified URL.</summary>
            ///<param name='path' type='string'>A path to a resource within an app/extension expressed relative to its install directory.</param>
        },
        onBrowserUpdateAvailable: {
            addListener: function (callback) {
                ///<summary></summary>
                ///<param name='callback' type='function'>function() {...} ;</param>
            }
        },
        onConnect: {
            addListener: function (callback) {
                ///<summary>Fired when a connection is made from either an extension process or a content script.</summary>
                ///<param name='callback' type='function'>function( Port port) {...} ;</param>
            }
        },
        onConnectExternal: {
            addListener: function (callback) {
                ///<summary>Fired when a connection is made from another extension.</summary>
                ///<param name='callback' type='function'>function( Port port) {...} ;</param>
            }
        },
        onInstalled: {
            addListener: function (callback) {
                ///<summary>Fired when the extension is first installed, when the extension is updated to a new version, and when Chrome is updated to a new version.</summary>
                ///<param name='callback' type='function'>function(object details) {...} ;</param>
            }
        },
        onMessage: {
            addListener: function (callback) {
                ///<summary>Fired when a message is sent from either an extension process or a content script.</summary>
                ///<param name='callback' type='function'>function(any message, MessageSender sender, function sendResponse) {...} ;</param>
            }
        },
        onMessageExternal: {
            addListener: function (callback) {
                ///<summary>Fired when a message is sent from another extension/app. Cannot be used in a content script.</summary>
                ///<param name='callback' type='function'>function(any message, MessageSender sender, function sendResponse) {...} ;</param>
            }
        },
        onRestartRequired: {
            addListener: function (callback) {
                ///<summary>Fired when an app or the device that it runs on needs to be restarted. The app should close all its windows at its earliest convenient time to let the restart to happen. If the app does nothing, a restart will be enforced after a 24-hour grace period has passed. Currently, this event is only fired for Chrome OS kiosk apps.</summary>
                ///<param name='callback' type='function'>function(enum of \app_update\ , \os_update\ , or \periodic\ reason) {...} ;</param>
            }
        },
        onStartup: {
            addListener: function (callback) {
                ///<summary>Fired when a profile that has this extension installed first starts up. This event is not fired when an incognito profile is started, even if this extension is operating in 'split' incognito mode.</summary>
                ///<param name='callback' type='function'>function() {...} ;</param>
            }
        },
        onSuspend: {
            addListener: function (callback) {
                ///<summary>Sent to the event page just before it is unloaded. This gives the extension opportunity to do some clean up. Note that since the page is unloading, any asynchronous operations started while handling this event are not guaranteed to complete. If more activity for the event page occurs before it gets unloaded the onSuspendCanceled event will be sent and the page won't be unloaded.</summary>
                ///<param name='callback' type='function'>function() {...} ;</param>
            }
        },
        onSuspendCanceled: {
            addListener: function (callback) {
                ///<summary>Sent after onSuspend to indicate that the app won't be unloaded after all.</summary>
                ///<param name='callback' type='function'>function() {...} ;</param>
            }
        },
        onUpdateAvailable: {
            addListener: function (callback) {
                ///<summary>Fired when an update is available, but isn't installed immediately because the app is currently running. If you do nothing, the update will be installed the next time the background page gets unloaded, if you want it to be installed sooner you can explicitly call chrome.runtime.reload().</summary>
                ///<param name='callback' type='function'>function(object details) {...} ;</param>
            }
        },
        reload: function () { },
        requestUpdateCheck: function (callback) {
            ///<summary>Requests an update check for this app/extension.</summary>
            ///<param name='callback' type='function'>function(enum of \throttled\ , \no_update\ , or \update_available\ status, object details) {...} ;</param>
        },
        restart: function () { },
        sendMessage: function (extensionId, message, options, responseCallback) {
            ///<summary>Sends a single message to onMessage event listeners within the extension (or another extension/app). Similar to chrome.runtime.connect, but only sends a single message with an optional response. The onMessage event is fired in each extension page of the extension. Note that extensions cannot send messages to content scripts using this method. To send messages to content scripts, use tabs.sendMessage .</summary>
            ///<param name='extensionId' type='string'> (optional) The extension ID of the extension you want to connect to. If omitted, default is your own extension.</param> 
            ///<param name='message' type='any'></param> 
            ///<param name='options' type='object'> (optional) {includeTlsChannelId: (optional boolean)}</param> 
            ///<param name='responseCallback' type='function'> (optional) </param>
        },
        sendNativeMessage: function (application, message, responseCallback) {
            ///<summary>Send a single message to a native application.</summary>
            ///<param name='application' type='string'>The name of the native messaging host.</param> 
            ///<param name='message' type='object'>The message that will be passed to the native messaging host.</param> 
            ///<param name='responseCallback' type='function'> (optional) </param>
        },
        setUninstallUrl: function (url) {
            ///<summary>Sets the URL to be visited upon uninstallation. This may be used to clean up server-side data, do analytics, and implement surveys. Maximum 255 characters.</summary>
            ///<param name='url' type='string'></param>
        }
    },
    storage: {
        onChanged: {
            addListener: function (callback) {
                ///<summary>Fired when one or more items change.</summary>
                ///<param name='callback' type='function'>function(object changes, string areaName) {...} ;</param>
            }
        }
    },
    system: {
        storage: {
            ejectDevice: function (id, callback) {
                ///<summary>Ejects a removable storage device.</summary>
                ///<param name='id' type='string'></param> 
                ///<param name='callback' type='function'>function(enum of \success\ , \in_use\ , \no_such_device\ , or \failure\ result) {...} ;</param>
            },
            getAvailableCapacity: function (id, callback) {
                ///<summary>Get the available capacity of a specified |id| storage device. The |id| is the transient device ID from StorageUnitInfo.</summary>
                ///<param name='id' type='string'></param> 
                ///<param name='callback' type='function'>function(object info) {...} ;</param>
            },
            getInfo: function (callback) {
                ///<summary>Get the storage information from the system. The argument passed to the callback is an array of StorageUnitInfo objects.</summary>
                ///<param name='callback' type='function'>function(array of StorageUnitInfo info) {...} ;</param>
            },
            onAttached: {
                addListener: function (callback) {
                    ///<summary>Fired when a new removable storage is attached to the system.</summary>
                    ///<param name='callback' type='function'>function( StorageUnitInfo info) {...} ;</param>
                }
            },
            onDetached: {
                addListener: function (callback) {
                    ///<summary>Fired when a removable storage is detached from the system.</summary>
                    ///<param name='callback' type='function'>function(string id) {...} ;</param>
                }
            }
        }
    },
    tabCapture: {
        capture: function (options, callback) {
            ///<summary>Captures the visible area of the currently active tab. This method can only be used on the currently active page after the extension has been invoked , similar to the way that activeTab works.</summary>
            ///<param name='options' type='object'>Configures the returned media stream.{audioConstraints: (optional MediaStreamConstraint ), audio: (optional boolean), video: (optional boolean), videoConstraints: (optional MediaStreamConstraint )}</param> 
            ///<param name='callback' type='function'>function(localmediastream stream) {...} ;</param>
        },
        getCapturedTabs: function (callback) {
            ///<summary>Returns a list of tabs that have requested capture or are being captured, i.e. status != stopped and status != error. This allows extensions to inform the user that there is an existing tab capture that would prevent a new tab capture from succeeding (or to prevent redundant requests for the same tab).</summary>
            ///<param name='callback' type='function'>function(array of CaptureInfo result) {...} ;</param>
        },
        onStatusChanged: {
            addListener: function (callback) {
                ///<summary>Event fired when the capture status of a tab changes. This allows extension authors to keep track of the capture status of tabs to keep UI elements like page actions and infobars in sync.</summary>
                ///<param name='callback' type='function'>function( CaptureInfo info) {...} ;</param>
            }
        }
    },
    tabs: {
        captureVisibleTab: function (windowId, options, callback) {
            ///<summary>Captures the visible area of the currently active tab in the specified window. You must have host permission for the URL displayed by the tab.</summary>
            ///<param name='windowId' type='integer'> (optional) None</param> 
            ///<param name='options' type='object'> (optional) Set parameters of image capture, such as the format of the resulting image.{quality: (optional integer), format: (optional enumof \\jpeg\\ ,or \\png\\ )}</param> 
            ///<param name='callback' type='function'>function(string dataUrl) {...} ;</param>
        },
        connect: function (tabId, connectInfo) {
            ///<summary>Connects to the content script(s) in the specified tab. The runtime.onConnect event is fired in each content script running in the specified tab for the current extension. For more details, see Content Script Messaging .</summary>
            ///<param name='tabId' type='integer'></param> 
            ///<param name='connectInfo' type='object'> (optional) {name: (optional string)}</param>
        },
        create: function (createProperties, callback) {
            ///<summary>Creates a new tab.</summary>
            ///<param name='createProperties' type='object'>{index: (optional integer), openerTabId: (optional integer), url: (optional string), selected: (optional boolean), pinned: (optional boolean), windowId: (optional integer), active: (optional boolean)}</param> 
            ///<param name='callback' type='function'> (optional) function( Tab tab) {...} ;</param>
        },
        detectLanguage: function (tabId, callback) {
            ///<summary>Detects the primary language of the content in a tab.</summary>
            ///<param name='tabId' type='integer'> (optional) None</param> 
            ///<param name='callback' type='function'>function(string language) {...} ;</param>
        },
        duplicate: function (tabId, callback) {
            ///<summary>Duplicates a tab.</summary>
            ///<param name='tabId' type='integer'>The ID of the tab which is to be duplicated.</param> 
            ///<param name='callback' type='function'> (optional) function( Tab tab) {...} ;</param>
        },
        executeScript: function (tabId, details, callback) {
            ///<summary>Injects JavaScript code into a page. For details, see the programmatic injection section of the content scripts doc.</summary>
            ///<param name='tabId' type='integer'> (optional) The ID of the tab in which to run the script; defaults to the active tab of the current window.</param> 
            ///<param name='details' type='InjectDetails'>Details of the script to run.</param> 
            ///<param name='callback' type='function'> (optional) function(array of any result) {...} ;</param>
        },
        get: function (tabId, callback) {
            ///<summary>Retrieves details about the specified tab.</summary>
            ///<param name='tabId' type='integer'></param> 
            ///<param name='callback' type='function'>function( Tab tab) {...} ;</param>
        },
        getAllInWindow: function (windowId, callback) {
            ///<summary>Gets details about all tabs in the specified window.</summary>
            ///<param name='windowId' type='integer'> (optional) None</param> 
            ///<param name='callback' type='function'>function(array of Tab tabs) {...} ;</param>
        },
        getCurrent: function (callback) {
            ///<summary>Gets the tab that this script call is being made from. May be undefined if called from a non-tab context (for example: a background page or popup view).</summary>
            ///<param name='callback' type='function'>function( Tab tab) {...} ;</param>
        },
        getSelected: function (windowId, callback) {
            ///<summary>Gets the tab that is selected in the specified window.</summary>
            ///<param name='windowId' type='integer'> (optional) None</param> 
            ///<param name='callback' type='function'>function( Tab tab) {...} ;</param>
        },
        highlight: function (highlightInfo, callback) {
            ///<summary>Highlights the given tabs.</summary>
            ///<param name='highlightInfo' type='object'>{tabs: (arrayofintegerorinteger), windowId: (integer), tabIds: (arrayofinteger)}</param> 
            ///<param name='callback' type='function'>function( windows.Window window) {...} ;</param>
        },
        insertCSS: function (tabId, details, callback) {
            ///<summary>Injects CSS into a page. For details, see the programmatic injection section of the content scripts doc.</summary>
            ///<param name='tabId' type='integer'> (optional) The ID of the tab in which to insert the CSS; defaults to the active tab of the current window.</param> 
            ///<param name='details' type='InjectDetails'>Details of the CSS text to insert.</param> 
            ///<param name='callback' type='function'> (optional) function() {...} ;</param>
        },
        move: function (tabIds, moveProperties, callback) {
            ///<summary>Moves one or more tabs to a new position within its window, or to a new window. Note that tabs can only be moved to and from normal (window.type === \normal\) windows.</summary>
            ///<param name='tabIds' type='integer or array of integer'>The tab or list of tabs to move.</param> 
            ///<param name='moveProperties' type='object'>{index: (integer), windowId: (optional integer)}</param> 
            ///<param name='callback' type='function'> (optional) function( Tab or array of Tab tabs) {...} ;</param>
        },
        onActivated: {
            addListener: function (callback) {
                ///<summary>Fires when the active tab in a window changes. Note that the tab's URL may not be set at the time this event fired, but you can listen to onUpdated events to be notified when a URL is set.</summary>
                ///<param name='callback' type='function'>function(object activeInfo) {...} ;</param>
            }
        },
        onActiveChanged: {
            addListener: function (callback) {
                ///<summary></summary>
                ///<param name='callback' type='function'>function(integer tabId, object selectInfo) {...} ;</param>
            }
        },
        onAttached: {
            addListener: function (callback) {
                ///<summary>Fired when a tab is attached to a window, for example because it was moved between windows.</summary>
                ///<param name='callback' type='function'>function(integer tabId, object attachInfo) {...} ;</param>
            }
        },
        onCreated: {
            addListener: function (callback) {
                ///<summary>Fired when a tab is created. Note that the tab's URL may not be set at the time this event fired, but you can listen to onUpdated events to be notified when a URL is set.</summary>
                ///<param name='callback' type='function'>function( Tab tab) {...} ;</param>
            }
        },
        onDetached: {
            addListener: function (callback) {
                ///<summary>Fired when a tab is detached from a window, for example because it is being moved between windows.</summary>
                ///<param name='callback' type='function'>function(integer tabId, object detachInfo) {...} ;</param>
            }
        },
        onHighlightChanged: {
            addListener: function (callback) {
                ///<summary></summary>
                ///<param name='callback' type='function'>function(object selectInfo) {...} ;</param>
            }
        },
        onHighlighted: {
            addListener: function (callback) {
                ///<summary>Fired when the highlighted or selected tabs in a window changes.</summary>
                ///<param name='callback' type='function'>function(object highlightInfo) {...} ;</param>
            }
        },
        onMoved: {
            addListener: function (callback) {
                ///<summary>Fired when a tab is moved within a window. Only one move event is fired, representing the tab the user directly moved. Move events are not fired for the other tabs that must move in response. This event is not fired when a tab is moved between windows. For that, see onDetached .</summary>
                ///<param name='callback' type='function'>function(integer tabId, object moveInfo) {...} ;</param>
            }
        },
        onRemoved: {
            addListener: function (callback) {
                ///<summary>Fired when a tab is closed.</summary>
                ///<param name='callback' type='function'>function(integer tabId, object removeInfo) {...} ;</param>
            }
        },
        onReplaced: {
            addListener: function (callback) {
                ///<summary>Fired when a tab is replaced with another tab due to prerendering or instant.</summary>
                ///<param name='callback' type='function'>function(integer addedTabId, integer removedTabId) {...} ;</param>
            }
        },
        onSelectionChanged: {
            addListener: function (callback) {
                ///<summary></summary>
                ///<param name='callback' type='function'>function(integer tabId, object selectInfo) {...} ;</param>
            }
        },
        onUpdated: {
            addListener: function (callback) {
                ///<summary>Fired when a tab is updated.</summary>
                ///<param name='callback' type='function'>function(integer tabId, object changeInfo, Tab tab) {...} ;</param>
            }
        },
        query: function (queryInfo, callback) {
            ///<summary>Gets all tabs that have the specified properties, or all tabs if no properties are specified.</summary>
            ///<param name='queryInfo' type='object'>{status: (optional enumof \\loading\\ ,or \\complete\\ ), highlighted: (optional boolean), title: (optional string), url: (optional string), index: (optional integer), lastFocusedWindow: (optional boolean), pinned: (optional boolean), currentWindow: (optional boolean), windowId: (optional integer), windowType: (optional enumof \\normal\\ , \\popup\\ , \\panel\\ ,or \\app\\ ), active: (optional boolean)}</param> 
            ///<param name='callback' type='function'>function(array of Tab result) {...} ;</param>
        },
        reload: function (tabId, reloadProperties, callback) {
            ///<summary>Reload a tab.</summary>
            ///<param name='tabId' type='integer'> (optional) The ID of the tab to reload; defaults to the selected tab of the current window.</param> 
            ///<param name='reloadProperties' type='object'> (optional) {bypassCache: (optional boolean)}</param> 
            ///<param name='callback' type='function'> (optional) function() {...} ;</param>
        },
        remove: function (tabIds, callback) {
            ///<summary>Closes one or more tabs.</summary>
            ///<param name='tabIds' type='integer or array of integer'>The tab or list of tabs to close.</param> 
            ///<param name='callback' type='function'> (optional) function() {...} ;</param>
        },
        sendMessage: function (tabId, message, responseCallback) {
            ///<summary>Sends a single message to the content script(s) in the specified tab, with an optional callback to run when a response is sent back. The runtime.onMessage event is fired in each content script running in the specified tab for the current extension.</summary>
            ///<param name='tabId' type='integer'></param> 
            ///<param name='message' type='any'></param> 
            ///<param name='responseCallback' type='function'> (optional) </param>
        },
        sendRequest: function (tabId, request, responseCallback) {
            ///<summary>Sends a single request to the content script(s) in the specified tab, with an optional callback to run when a response is sent back. The extension.onRequest event is fired in each content script running in the specified tab for the current extension.</summary>
            ///<param name='tabId' type='integer'></param> 
            ///<param name='request' type='any'></param> 
            ///<param name='responseCallback' type='function'> (optional) </param>
        },
        update: function (tabId, updateProperties, callback) {
            ///<summary>Modifies the properties of a tab. Properties that are not specified in updateProperties are not modified.</summary>
            ///<param name='tabId' type='integer'> (optional) None</param> 
            ///<param name='updateProperties' type='object'>{pinned: (optional boolean), openerTabId: (optional integer), url: (optional string), selected: (optional boolean), highlighted: (optional boolean), active: (optional boolean)}</param> 
            ///<param name='callback' type='function'> (optional) function( Tab tab) {...} ;</param>
        }
    },
    topSites: {
        get: function (callback) {
            ///<summary>Gets a list of top sites.</summary>
            ///<param name='callback' type='function'>function(array of MostVisitedURL data) {...} ;</param>
        }
    },
    tts: {
        getVoices: function (callback) {
            ///<summary>Gets an array of all available voices.</summary>
            ///<param name='callback' type='function'> (optional) function(array of TtsVoice voices) {...} ;</param>
        },
        isSpeaking: function (callback) {
            ///<summary>Checks whether the engine is currently speaking. On Mac OS X, the result is true whenever the system speech engine is speaking, even if the speech wasn't initiated by Chrome.</summary>
            ///<param name='callback' type='function'> (optional) function(boolean speaking) {...} ;</param>
        },
        pause: function () { },
        resume: function () { },
        speak: function (utterance, options, callback) {
            ///<summary>Speaks text using a text-to-speech engine.</summary>
            ///<param name='utterance' type='string'>The text to speak, either plain text or a complete, well-formed SSML document. Speech engines that do not support SSML will strip away the tags and speak the text. The maximum length of the text is 32,768 characters.</param> 
            ///<param name='options' type='object'> (optional) The speech options.{lang: (optional string), voiceName: (optional string), extensionId: (optional string), gender: (optional enumof \\male\\ ,or \\female\\ ), requiredEventTypes: (optional arrayofstring), volume: (optional double), enqueue: (optional boolean), rate: (optional double), onEvent: (optional function), pitch: (optional double), desiredEventTypes: (optional arrayofstring)}</param> 
            ///<param name='callback' type='function'> (optional) function() {...} ;</param>
        },
        stop: function () { }
    },
    ttsEngine: {
        onPause: {
            addListener: function (callback) {
                ///<summary>Optional: if an engine supports the pause event, it should pause the current utterance being spoken, if any, until it receives a resume event or stop event. Note that a stop event should also clear the paused state.</summary>
                ///<param name='callback' type='function'>function() {...} ;</param>
            }
        },
        onResume: {
            addListener: function (callback) {
                ///<summary>Optional: if an engine supports the pause event, it should also support the resume event, to continue speaking the current utterance, if any. Note that a stop event should also clear the paused state.</summary>
                ///<param name='callback' type='function'>function() {...} ;</param>
            }
        },
        onSpeak: {
            addListener: function (callback) {
                ///<summary>Called when the user makes a call to tts.speak() and one of the voices from this extension's manifest is the first to match the options object.</summary>
                ///<param name='callback' type='function'>function(string utterance, object options, function sendTtsEvent) {...} ;</param>
            }
        },
        onStop: {
            addListener: function (callback) {
                ///<summary>Fired when a call is made to tts.stop and this extension may be in the middle of speaking. If an extension receives a call to onStop and speech is already stopped, it should do nothing (not raise an error). If speech is in the paused state, this should cancel the paused state.</summary>
                ///<param name='callback' type='function'>function() {...} ;</param>
            }
        }
    },
    types: {
        ChromeSetting: {
            clear: function (details, callback) {
                ///<summary>Clears the setting. This way default settings can become effective again.</summary>
                ///<param name="details" type="Object">{scope: (string)}</param>
                ///<param name="callback" type="Function">function() {...}</param>
            },
            get: function (details, callback) {
                ///<summary>Gets the value of a setting.</summary>
                ///<param name="details" type="Object">{incognito: (boolean)}</param>
                ///<param name="callback" type="Function">function(object details) {...}</param>
            },
            set: function (details, callback) {
                ///<summary>Sets the value of a setting.</summary>
                ///<param name="details" type="Object">{value: (any), scope: (string)}</param>
                ///<param name="callback" type="Function">function() {...}</param>
            },
            onChange: {
                addListener: function (listener) {
                    ///<summary>Fired when the value of the setting changes.</summary>
                    ///<param name="listener" type="Function">function(object details) {...}</param>
                }
            }
        }
    },
    webNavigation: {
        getAllFrames: function (details, callback) {
            ///<summary>Retrieves information about all frames of a given tab.</summary>
            ///<param name='details' type='object'>Information about the tab to retrieve all frames from.{processId: (integer), tabId: (integer), parentFrameId: (integer), transitionType: (enumof \\link\\ , \\typed\\ , \\auto_bookmark\\ , \\auto_subframe\\ , \\manual_subframe\\ , \\generated\\ , \\start_page\\ , \\form_submit\\ , \\reload\\ , \\keyword\\ ,or \\keyword_generated\\ ), url: (string), timeStamp: (double), replacedTabId: (integer), frameId: (integer), sourceTabId: (integer), sourceProcessId: (integer), sourceFrameId: (integer), transitionQualifiers: (arrayofenumof \\client_redirect\\ , \\server_redirect\\ , \\forward_back\\ ,or \\from_address_bar\\ ), error: (string), errorOccurred: (boolean)}</param> 
            ///<param name='callback' type='function'>function(array of object details) {...} ;</param>
        },
        getFrame: function (details, callback) {
            ///<summary>Retrieves information about the given frame. A frame refers to an <iframe> or a <frame> of a web page and is identified by a tab ID and a frame ID.</summary>
            ///<param name='details' type='object'>Information about the frame to retrieve information about.{processId: (integer), tabId: (integer), parentFrameId: (integer), transitionType: (enumof \\link\\ , \\typed\\ , \\auto_bookmark\\ , \\auto_subframe\\ , \\manual_subframe\\ , \\generated\\ , \\start_page\\ , \\form_submit\\ , \\reload\\ , \\keyword\\ ,or \\keyword_generated\\ ), url: (string), timeStamp: (double), replacedTabId: (integer), frameId: (integer), sourceTabId: (integer), sourceProcessId: (integer), sourceFrameId: (integer), transitionQualifiers: (arrayofenumof \\client_redirect\\ , \\server_redirect\\ , \\forward_back\\ ,or \\from_address_bar\\ ), error: (string), errorOccurred: (boolean)}</param> 
            ///<param name='callback' type='function'>function(object details) {...} ;</param>
        },
        onBeforeNavigate: {
            addListener: function (callback) {
                ///<summary>Fired when a navigation is about to occur.</summary>
                ///<param name='callback' type='function'>function(object details) {...} ;</param>
            }
        },
        onCommitted: {
            addListener: function (callback) {
                ///<summary>Fired when a navigation is committed. The document (and the resources it refers to, such as images and subframes) might still be downloading, but at least part of the document has been received from the server and the browser has decided to switch to the new document.</summary>
                ///<param name='callback' type='function'>function(object details) {...} ;</param>
            }
        },
        onCompleted: {
            addListener: function (callback) {
                ///<summary>Fired when a document, including the resources it refers to, is completely loaded and initialized.</summary>
                ///<param name='callback' type='function'>function(object details) {...} ;</param>
            }
        },
        onCreatedNavigationTarget: {
            addListener: function (callback) {
                ///<summary>Fired when a new window, or a new tab in an existing window, is created to host a navigation.</summary>
                ///<param name='callback' type='function'>function(object details) {...} ;</param>
            }
        },
        onDOMContentLoaded: {
            addListener: function (callback) {
                ///<summary>Fired when the page's DOM is fully constructed, but the referenced resources may not finish loading.</summary>
                ///<param name='callback' type='function'>function(object details) {...} ;</param>
            }
        },
        onErrorOccurred: {
            addListener: function (callback) {
                ///<summary>Fired when an error occurs and the navigation is aborted. This can happen if either a network error occurred, or the user aborted the navigation.</summary>
                ///<param name='callback' type='function'>function(object details) {...} ;</param>
            }
        },
        onHistoryStateUpdated: {
            addListener: function (callback) {
                ///<summary>Fired when the frame's history was updated to a new URL. All future events for that frame will use the updated URL.</summary>
                ///<param name='callback' type='function'>function(object details) {...} ;</param>
            }
        },
        onReferenceFragmentUpdated: {
            addListener: function (callback) {
                ///<summary>Fired when the reference fragment of a frame was updated. All future events for that frame will use the updated URL.</summary>
                ///<param name='callback' type='function'>function(object details) {...} ;</param>
            }
        },
        onTabReplaced: {
            addListener: function (callback) {
                ///<summary>Fired when the contents of the tab is replaced by a different (usually previously pre-rendered) tab.</summary>
                ///<param name='callback' type='function'>function(object details) {...} ;</param>
            }
        }
    },
    webRequest: {
        handlerBehaviorChanged: function (callback) {
            ///<summary>Needs to be called when the behavior of the webRequest handlers has changed to prevent incorrect handling due to caching. This function call is expensive. Don't call it often.</summary>
            ///<param name='callback' type='function'> (optional) function() {...} ;</param>
        },
        onAuthRequired: {
            addListener: function (callback) {
                ///<summary>Fired when an authentication failure is received. The listener has three options: it can provide authentication credentials, it can cancel the request and display the error page, or it can take no action on the challenge. If bad user credentials are provided, this may be called multiple times for the same request.</summary>
                ///<param name='callback' type='function'>function(object details, function callback) {...} ;</param>
            }
        },
        onBeforeRedirect: {
            addListener: function (callback) {
                ///<summary>Fired when a server-initiated redirect is about to occur.</summary>
                ///<param name='callback' type='function'>function(object details) {...} ;</param>
            }
        },
        onBeforeRequest: {
            addListener: function (callback) {
                ///<summary>Fired when a request is about to occur.</summary>
                ///<param name='callback' type='function'>function(object details) {...} ;</param>
            }
        },
        onBeforeSendHeaders: {
            addListener: function (callback) {
                ///<summary>Fired before sending an HTTP request, once the request headers are available. This may occur after a TCP connection is made to the server, but before any HTTP data is sent.</summary>
                ///<param name='callback' type='function'>function(object details) {...} ;</param>
            }
        },
        onCompleted: {
            addListener: function (callback) {
                ///<summary>Fired when a request is completed.</summary>
                ///<param name='callback' type='function'>function(object details) {...} ;</param>
            }
        },
        onErrorOccurred: {
            addListener: function (callback) {
                ///<summary>Fired when an error occurs.</summary>
                ///<param name='callback' type='function'>function(object details) {...} ;</param>
            }
        },
        onHeadersReceived: {
            addListener: function (callback) {
                ///<summary>Fired when HTTP response headers of a request have been received.</summary>
                ///<param name='callback' type='function'>function(object details) {...} ;</param>
            }
        },
        onResponseStarted: {
            addListener: function (callback) {
                ///<summary>Fired when the first byte of the response body is received. For HTTP requests, this means that the status line and response headers are available.</summary>
                ///<param name='callback' type='function'>function(object details) {...} ;</param>
            }
        },
        onSendHeaders: {
            addListener: function (callback) {
                ///<summary>Fired just before a request is going to be sent to the server (modifications of previous onBeforeSendHeaders callbacks are visible by the time onSendHeaders is fired).</summary>
                ///<param name='callback' type='function'>function(object details) {...} ;</param>
            }
        }
    },
    webstore: {
        install: function (url, successCallback, failureCallback) {
            ///<summary></summary>
            ///<param name='url' type='string'> (optional) None</param> 
            ///<param name='successCallback' type='function'> (optional) This function is invoked when inline installation successfully completes (after the dialog is shown and the user agrees to add the item to Chrome). You may wish to use this to hide the user interface element that prompted the user to install the app or extension.</param> 
            ///<param name='failureCallback' type='function'> (optional) This function is invoked when inline installation does not successfully complete. Possible reasons for this include the user canceling the dialog, the linked item not being found in the store, or the install being initiated from a non-verified site.</param>
        }
    },
    windows: {
        create: function (createData, callback) {
            ///<summary>Creates (opens) a new browser with any optional sizing, position or default URL provided.</summary>
            ///<param name='createData' type='object'> (optional) {tabId: (optional integer), url: (optional stringorarrayofstring), top: (optional integer), height: (optional integer), width: (optional integer), focused: (optional boolean), incognito: (optional boolean), type: (optional enumof \\normal\\ , \\popup\\ , \\panel\\ ,or \\detached_panel\\ ), left: (optional integer)}</param> 
            ///<param name='callback' type='function'> (optional) function( Window window) {...} ;</param>
        },
        get: function (windowId, getInfo, callback) {
            ///<summary>Gets details about a window.</summary>
            ///<param name='windowId' type='integer'></param> 
            ///<param name='getInfo' type='object'> (optional) {populate: (optional boolean)}</param> 
            ///<param name='callback' type='function'>function( Window window) {...} ;</param>
        },
        getAll: function (getInfo, callback) {
            ///<summary>Gets all windows.</summary>
            ///<param name='getInfo' type='object'> (optional) {populate: (optional boolean)}</param> 
            ///<param name='callback' type='function'>function(array of Window windows) {...} ;</param>
        },
        getCurrent: function (getInfo, callback) {
            ///<summary>Gets the current window .</summary>
            ///<param name='getInfo' type='object'> (optional) {populate: (optional boolean)}</param> 
            ///<param name='callback' type='function'>function( Window window) {...} ;</param>
        },
        getLastFocused: function (getInfo, callback) {
            ///<summary>Gets the window that was most recently focused \u2014 typically the window 'on top'.</summary>
            ///<param name='getInfo' type='object'> (optional) {populate: (optional boolean)}</param> 
            ///<param name='callback' type='function'>function( Window window) {...} ;</param>
        },
        onCreated: {
            addListener: function (callback) {
                ///<summary>Fired when a window is created.</summary>
                ///<param name='callback' type='function'>function( Window window) {...} ;</param>
            }
        },
        onFocusChanged: {
            addListener: function (callback) {
                ///<summary>Fired when the currently focused window changes. Will be chrome.windows.WINDOW_ID_NONE if all chrome windows have lost focus. Note: On some Linux window managers, WINDOW_ID_NONE will always be sent immediately preceding a switch from one chrome window to another.</summary>
                ///<param name='callback' type='function'>function(integer windowId) {...} ;</param>
            }
        },
        onRemoved: {
            addListener: function (callback) {
                ///<summary>Fired when a window is removed (closed).</summary>
                ///<param name='callback' type='function'>function(integer windowId) {...} ;</param>
            }
        },
        remove: function (windowId, callback) {
            ///<summary>Removes (closes) a window, and all the tabs inside it.</summary>
            ///<param name='windowId' type='integer'></param> 
            ///<param name='callback' type='function'> (optional) function() {...} ;</param>
        },
        update: function (windowId, updateInfo, callback) {
            ///<summary>Updates the properties of a window. Specify only the properties that you want to change; unspecified properties will be left unchanged.</summary>
            ///<param name='windowId' type='integer'></param> 
            ///<param name='updateInfo' type='object'>{top: (optional integer), drawAttention: (optional boolean), height: (optional integer), width: (optional integer), state: (optional enumof \\normal\\ , \\minimized\\ , \\maximized\\ ,or \\fullscreen\\ ), focused: (optional boolean), left: (optional integer)}</param> 
            ///<param name='callback' type='function'> (optional) function( Window window) {...} ;</param>
        }
    }
}