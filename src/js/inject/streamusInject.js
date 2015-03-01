//  This code runs on all streamus.com domains.
$(function() {
    'use strict';

    //  Disable the install Streamus button when visiting the website after it has already been installed.
    var installButton = $('#installButton');

    if (installButton.length > 0) {
        installButton
            .attr('disabled', true)
            .text(chrome.i18n.getMessage('installed'));
    }
});