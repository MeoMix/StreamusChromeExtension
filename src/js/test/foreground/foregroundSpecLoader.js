define(function(require) {
    'use strict';
    /* jshint ignore:start */
    //  /view/
    //  /view/appBar/
    require('test/foreground/view/appBar/adminMenuAreaView.spec');
    require('test/foreground/view/appBar/appBarRegion.spec');
    require('test/foreground/view/appBar/appBarView.spec');
    require('test/foreground/view/appBar/nextButtonView.spec');
    require('test/foreground/view/appBar/playlistTitleView.spec');
    require('test/foreground/view/appBar/playPauseButtonView.spec');
    require('test/foreground/view/appBar/previousButtonView.spec');
    require('test/foreground/view/appBar/volumeAreaView.spec');

    //  /view/behavior/
    require('test/foreground/view/behavior/collectionViewMultiSelect.spec');
    require('test/foreground/view/behavior/itemViewMultiSelect.spec');
    require('test/foreground/view/behavior/scrollable.spec');
    require('test/foreground/view/behavior/slidingRender.spec');
    require('test/foreground/view/behavior/sortable.spec');
    require('test/foreground/view/behavior/tooltipable.spec');

    //  /view/contextMenu/
    require('test/foreground/view/contextMenu/contextMenuItemView.spec');
    require('test/foreground/view/contextMenu/contextMenuRegion.spec');
    require('test/foreground/view/contextMenu/contextMenuView.spec');

    //  /view/dialog/
    require('test/foreground/view/dialog/aboutStreamusDialogView.spec');
    require('test/foreground/view/dialog/aboutStreamusView.spec');
    require('test/foreground/view/dialog/browserSettingsDialogView.spec');
    require('test/foreground/view/dialog/browserSettingsView.spec');
    require('test/foreground/view/dialog/clearStreamDialogView.spec');
    require('test/foreground/view/dialog/createPlaylistDialogView.spec');
    require('test/foreground/view/dialog/createPlaylistView.spec');
    require('test/foreground/view/dialog/deletePlaylistDialogView.spec');
    require('test/foreground/view/dialog/deletePlaylistView.spec');
    require('test/foreground/view/dialog/dialogContentView.spec');
    require('test/foreground/view/dialog/dialogRegion.spec');
    require('test/foreground/view/dialog/dialogView.spec');
    require('test/foreground/view/dialog/editPlaylistDialogView.spec');
    require('test/foreground/view/dialog/editPlaylistView.spec');
    require('test/foreground/view/dialog/errorDialogView.spec');
    require('test/foreground/view/dialog/exportPlaylistDialogView.spec');
    require('test/foreground/view/dialog/exportPlaylistView.spec');
    require('test/foreground/view/dialog/googleSignInDialogView.spec');
    require('test/foreground/view/dialog/linkUserIdDialogView.spec');
    require('test/foreground/view/dialog/settingsDialogView.spec');
    require('test/foreground/view/dialog/settingsView.spec');
    require('test/foreground/view/dialog/updateStreamusDialogView.spec');

    //  /view/element/
    require('test/foreground/view/element/checkboxView.spec');
    require('test/foreground/view/element/radioButtonView.spec');
    require('test/foreground/view/element/radioGroupView.spec');
    require('test/foreground/view/element/simpleListItemView.spec');
    require('test/foreground/view/element/simpleMenuItemsView.spec');
    require('test/foreground/view/element/simpleMenuItemView.spec');
    require('test/foreground/view/element/simpleMenuView.spec');
    require('test/foreground/view/element/spinnerView.spec');
    require('test/foreground/view/element/switchView.spec');

    //  /view/leftPane/
    require('test/foreground/view/leftPane/activePlaylistAreaView.spec');
    require('test/foreground/view/leftPane/leftPaneRegion.spec');
    require('test/foreground/view/leftPane/leftPaneView.spec');
    require('test/foreground/view/leftPane/playlistItemsView.spec');
    require('test/foreground/view/leftPane/playlistItemView.spec');
    require('test/foreground/view/leftPane/signInView.spec');

    //  /view/listItemButton/
    require('test/foreground/view/listItemButton/addPlaylistButtonView.spec');
    require('test/foreground/view/listItemButton/addSongButtonView.spec');
    require('test/foreground/view/listItemButton/deletePlaylistButtonView.spec');
    require('test/foreground/view/listItemButton/deleteSongButtonView.spec');
    require('test/foreground/view/listItemButton/listItemButtonsView.spec');
    require('test/foreground/view/listItemButton/listItemButtonView.spec');
    require('test/foreground/view/listItemButton/moreActionsButtonView.spec');
    require('test/foreground/view/listItemButton/playPauseSongButtonView.spec');
    require('test/foreground/view/listItemButton/playPlaylistButtonView.spec');
    require('test/foreground/view/listItemButton/saveSongButtonView.spec');

    //  /view/notification/
    require('test/foreground/view/notification/notificationRegion.spec');
    require('test/foreground/view/notification/notificationView.spec');

    //  /view/playlist/
    require('test/foreground/view/playlist/playlistsAreaRegion.spec');
    require('test/foreground/view/playlist/playlistsAreaView.spec');
    require('test/foreground/view/playlist/playlistsView.spec');
    require('test/foreground/view/playlist/playlistView.spec');

    //  /view/saveSongs/
    require('test/foreground/view/saveSongs/saveSongsRegion.spec');

    //  /view/search/
    require('test/foreground/view/search/searchAreaRegion.spec');
    require('test/foreground/view/search/searchResultsView.spec');
    require('test/foreground/view/search/searchResultView.spec');
    require('test/foreground/view/search/searchView.spec');

    //  /view/selectionBar/
    require('test/foreground/view/selectionBar/selectionBarRegion.spec');
    require('test/foreground/view/selectionBar/selectionBarView.spec');

    //  /view/stream/
    require('test/foreground/view/stream/activeStreamItemView.spec');
    require('test/foreground/view/stream/clearStreamButtonView.spec');
    require('test/foreground/view/stream/radioButtonView.spec');
    require('test/foreground/view/stream/repeatButtonView.spec');
    require('test/foreground/view/stream/saveStreamButtonView.spec');
    require('test/foreground/view/stream/shuffleButtonView.spec');
    require('test/foreground/view/stream/streamItemsView.spec');
    require('test/foreground/view/stream/streamItemView.spec');
    require('test/foreground/view/stream/streamRegion.spec');
    require('test/foreground/view/stream/streamView.spec');
    require('test/foreground/view/stream/timeAreaView.spec');

    //  /view/tooltip/
    require('test/foreground/view/tooltip/tooltipRegion.spec');
    require('test/foreground/view/tooltip/tooltipView.spec');

    //  /view/video/
    require('test/foreground/view/video/videoRegion.spec');
    require('test/foreground/view/video/videoView.spec');

    require('test/foreground/view/foregroundAreaView.spec');
    require('test/foreground/view/listItemView.spec');
    /* jshint ignore:end */
});