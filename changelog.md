v0.172
======

- Refactored Gruntfile.js completely so that it is much more concise and elegant.
- Removed the references to 'localhost' in manifest.json. Server now supports CORS requests and expects the Streamus' extension ID.
- Updated locales for several languages.
- Enforcing tighter code quality across the entire extension based on analysis of popular GitHub repository coding standards.
- Removed two required permissions for injecting JavaScript into Streamus' website. Instead, Streamus will respond to messages from the website.
- Sharing playlists no longer occurs on share.streamus.com. Instead, it can be found at streamus.com/share
- Removed some legacy code for handling older style of user stored in localStorage
- Tightened linting for LESS and JSHint

v0.169
======

- Selection bar now appears at the bottom when you have checked items. Provides a consistent interface for play/add/delete/save of items.
- Items can now only be selected by checking their checkbox area rather than the entire item. 
- Beatport content script code has been updated to support their new website.
- All Beatport pages are now supported by Streamus rather than just Top 10 and Top 100.
- Size of the volume icon has been increased.
- There are now "Add all / play all" buttons for search results.
- Search results no longer accidentally show incorrect results in some scenarios.
- Cancelling search results is now more performant and will fully terminate old search requests.
- You can now control desktop notifications through Streamus' settings. You can control the amount of time they appear for as well as whether they appear or not.
- chrome.identity.email is now requested. Note that I am not recording more information. This is simply a policy change on Google's side and I need to ask for chrome.identity.email in order to access your Google ID.
- Display issues fixed when showing notifications in Streamus while in a tab.
- Translations have been drastically improved and expanded upon.
- Streamus now keeps track of what language you're using it in so I can tell which translations are most important.
- The keyboard shortcut for saving currently playing song to current playlist has been re-introduced.
- Streamus will now tell YouTube to use HTML5 player automatically on Opera rather than requiring user to opt-in to the HTML5 trial.
- 'Add to Streamus' button on YouTube now works even if you are not signed into YouTube
- 'Add to Streamus' button now selects your current playlist by default
- Search Results now filter out songs which have been marked as not playable outside of YouTube.com. This should help alleviate some of the "Song cannot be played in embedded player" errors.
- Playlist 0000 has been renamed to New Playlist
- The playlists panel will now remember its scroll position even after Streamus has been closed and re-opened. Remembering the position for Playlist Items will come in the future.