//  This code runs on all streamus.com domains.
$(function () {
    'use strict';

    //  Disable the install Streamus button when visiting the website after it has already been installed.
    var installButton = $('#installButton');
    
    //  TODO: Apparently there's no way to detect uninstalling of Streamus from a single extension.
    //  Revisit in the future and re-affirm if this is still the case. [SA June 15th, 2013]
    if (installButton.length > 0) {
        installButton
            .attr('disabled', true)
            .text(chrome.i18n.getMessage('installed'));
    }

});