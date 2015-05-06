define(function(require) {
    'use strict';

    var YouTubeServiceType = require('background/enum/youTubeServiceType');
    var YouTubeV3API = require('background/model/youTubeV3API');

    describe('YouTubeV3API', function() {
        describe('when asked to get a list of information involving both available and unavailable songs', function() {
            before(function() {
                sinon.stub($, 'ajax').yieldsTo('success', {
                    items: [{
                        id: 'MKS8Jn_3bnA',
                        contentDetails: {
                            duration: 'PT4M33S'
                        },
                        snippet: {
                            channelTitle: 'jlmaha5',
                            title: 'Danger - 22h39'
                        },
                        status: {
                            embeddable: true
                        }
                    }, {
                        id: '6od4WeaWDcs',
                        contentDetails: {
                            duration: 'PT4M12S'
                        },
                        snippet: {
                            channelTitle: 'Mihai ŞiAtât',
                            title: 'King Fantastic & Kristina Rose: Why? Where? What? HD9'
                        },
                        status: {
                            embeddable: true
                        }
                    }]
                });
            });

            it('should return the available songs', function(done) {
                YouTubeV3API.getSongs({
                    songIds: ['MKS8Jn_3bnA', 'mNGpPqxsTmQ', '6od4WeaWDcs', 'JMPYmNINxrE'],
                    success: function(songs) {
                        expect($.ajax.calledOnce).to.equal(true);
                        expect(songs).not.to.equal(null);
                        expect(songs.length).to.equal(2);
                        done();
                    }
                });
            });

            after(function() {
                $.ajax.restore();
            });
        });

        describe('when asked to search for songs', function() {
            before(function() {
                /* jshint ignore:start */
                sinon.stub($, 'ajax')
                    .onFirstCall().yieldsTo('success', {'items': [{ 'id': { 'videoId': 'o4_1hS1aIC8' } }, { 'id': { 'videoId': 'n4LxHI8uV9A' } }, { 'id': { 'videoId': 'FijBkSvN6N8' } }, { 'id': { 'videoId': 'jfwwxnDmNk4' } }, { 'id': { 'videoId': 'JmR7D2funBM' } }, { 'id': { 'videoId': 'RhdG5wE5FH4' } }, { 'id': { 'videoId': 'LA5SfGNZCrU' } }, { 'id': { 'videoId': 'h8KnTyqki-o' } }, { 'id': { 'videoId': 'zvQJnBgG0ew' } }, { 'id': { 'videoId': 'KTuKTt_CecU' } }, { 'id': { 'videoId': 'pYmel9dPL4k' } }, { 'id': { 'videoId': '_m2zGncgLjw' } }, { 'id': { 'videoId': 'mUnMOG8xKsg' } }, { 'id': { 'videoId': 'vrVuGiKRVDU' } }, { 'id': { 'videoId': 'lYKRPzOi1zI' } }, { 'id': { 'videoId': 'W9SBq_FwtEg' } }, { 'id': { 'videoId': 'bypGsd527dM' } }, { 'id': { 'videoId': 'PwaYP81-0KE' } }, { 'id': { 'videoId': 'ouHtMSs02tY' } }, { 'id': { 'videoId': 'BHBWlJg4uGY' } }, { 'id': { 'videoId': 'jlJtJ1XNbJ8' } }, { 'id': { 'videoId': 'QQGEpKeR1Uc' } }, { 'id': { 'videoId': 'fceBCkG3dfM' } }, { 'id': { 'videoId': '6YNkE62Yxpo' } }, { 'id': { 'videoId': 'QGBfUfaFtaM' } }, { 'id': { 'videoId': 'MSjkcdPN_Jg' } }, { 'id': { 'videoId': 'b9TLfF67Rq8' } }, { 'id': { 'videoId': 'esAamBCFgfM' } }, { 'id': { 'videoId': '0H5EgF8Vjfs' } }, { 'id': { 'videoId': 'pE_2INEqmQc' } }, { 'id': { 'videoId': 'j6JUlQvbdqM' } }, { 'id': { 'videoId': 'mHX8lo1G8CU' } }, { 'id': { 'videoId': 'HGOg-D1PtSc' } }, { 'id': { 'videoId': 'HShoVk4jsKE' } }, { 'id': { 'videoId': 'md95KXppisA' } }, { 'id': { 'videoId': 'h92ZT6BmQMo' } }, { 'id': { 'videoId': 'yxrTGMijT6k' } }, { 'id': { 'videoId': 'Wv2CEeoL08A' } }, { 'id': { 'videoId': 'K0pxDoJ6e6k' } }, { 'id': { 'videoId': 'EKIrICNbFjU' } }, { 'id': { 'videoId': 'YfdtFqOK5Zc' } }, { 'id': { 'videoId': '5Q_9KDM3pwo' } }, { 'id': { 'videoId': 'kLgkVx1Dt-M' } }, { 'id': { 'videoId': 'nUOlnDD1uhs' } }, { 'id': { 'videoId': 'nbb4Vvi5dVY' } }, { 'id': { 'videoId': 'xVYdwVEqIJY' } }, { 'id': { 'videoId': 'ZVQezLQ25qo' } }, { 'id': { 'videoId': 'TGOPC_4RYDU' } }, { 'id': { 'videoId': 'ju7ICGdu4O8' } }, { 'id': { 'videoId': '-IiJk7ud4D4' } }] })
                    .onSecondCall().yieldsTo('success', { 'items': [{ 'id': 'o4_1hS1aIC8', 'snippet': { 'title': 'Best of Gramatik HD', 'channelTitle': 'Stay See' }, 'status': { 'embeddable': 'true' }, 'contentDetails': { 'duration': 'PT1H19M42S' } }, { 'id': 'n4LxHI8uV9A', 'snippet': { 'title': 'Gramatik - Beatz & Pieces Vol.1 (2012)', 'channelTitle': 'nohipster6' }, 'status': { 'embeddable': 'true' }, 'contentDetails': { 'duration': 'PT1H14M25S' } }, { 'id': 'FijBkSvN6N8', 'snippet': { 'title': 'Gramatik - Street Bangerz Vol. 3 FULL ALBUM', 'channelTitle': 'Damzon Blazer' }, 'status': { 'embeddable': 'true' }, 'contentDetails': { 'duration': 'PT1H11M37S' } }, { 'id': 'jfwwxnDmNk4', 'snippet': { 'title': 'Gramatik - The Age Of Reason (FULL ALBUM)', 'channelTitle': 'FREEDM Collective' }, 'status': { 'embeddable': 'true' }, 'contentDetails': { 'duration': 'PT1H12M6S' } }, { 'id': 'JmR7D2funBM', 'snippet': { 'title': 'Gramatik - No Shortcuts FULL ALBUM', 'channelTitle': 'Damzon Blazer' }, 'status': { 'embeddable': 'true' }, 'contentDetails': { 'duration': 'PT1H19M11S' } }, { 'id': 'RhdG5wE5FH4', 'snippet': { 'title': 'Gramatik - The Age Of Reason FULL ALBUM', 'channelTitle': 'Damzon Blazer' }, 'status': { 'embeddable': 'true' }, 'contentDetails': { 'duration': 'PT1H12M8S' } }, { 'id': 'LA5SfGNZCrU', 'snippet': { 'title': 'Gramatik - Brave Men feat. Eskobars (Official Music Video)', 'channelTitle': 'Gramatikk' }, 'status': { 'embeddable': 'true' }, 'contentDetails': { 'duration': 'PT5M31S' } }, { 'id': 'h8KnTyqki-o', 'snippet': { 'title': 'Best of Gramatik - Chillout Funkstep Soul', 'channelTitle': 'Sylver Screen' }, 'status': { 'embeddable': 'true' }, 'contentDetails': { 'duration': 'PT1H19M44S' } }, { 'id': 'zvQJnBgG0ew', 'snippet': { 'title': 'Gramatik-The Age Of Reason 2014 (Full Album) (HQ)', 'channelTitle': 'Spyros Fyl' }, 'status': { 'embeddable': 'true' }, 'contentDetails': { 'duration': 'PT1H12M7S' } }, { 'id': 'KTuKTt_CecU', 'snippet': { 'title': 'Gramatik - Street Bangerz Vol. 2 FULL ALBUM', 'channelTitle': 'Damzon Blazer' }, 'status': { 'embeddable': 'true' }, 'contentDetails': { 'duration': 'PT1H21M21S' } }, { 'id': 'pYmel9dPL4k', 'snippet': { 'title': 'Gramatik - Street Bangerz Vol. 1 FULL ALBUM', 'channelTitle': 'Damzon Blazer' }, 'status': { 'embeddable': 'true' }, 'contentDetails': { 'duration': 'PT57M6S' } }, { 'id': '_m2zGncgLjw', 'snippet': { 'title': 'Gramatik - Hit That Jive (Original Mix)', 'channelTitle': 'Djphanton' }, 'status': { 'embeddable': 'true' }, 'contentDetails': { 'duration': 'PT3M26S' } }, { 'id': 'mUnMOG8xKsg', 'snippet': { 'title': 'Gramatik - Muy Tranquilo', 'channelTitle': 'n3mvo' }, 'status': { 'embeddable': 'true' }, 'contentDetails': { 'duration': 'PT3M55S' } }, { 'id': 'vrVuGiKRVDU', 'snippet': { 'title': 'Gramatik | No Way Out', 'channelTitle': 'DailyMorningMusic' }, 'status': { 'embeddable': 'true' }, 'contentDetails': { 'duration': 'PT4M24S' } }, { 'id': 'lYKRPzOi1zI', 'snippet': { 'title': 'Gramatik - Just Jammin', 'channelTitle': 'optionsC' }, 'status': { 'embeddable': 'true' }, 'contentDetails': { 'duration': 'PT6M40S' } }, { 'id': 'W9SBq_FwtEg', 'snippet': { 'title': 'Gramatik - In This Whole World', 'channelTitle': 'Holy Chill' }, 'status': { 'embeddable': 'true' }, 'contentDetails': { 'duration': 'PT3M55S' } }, { 'id': 'bypGsd527dM', 'snippet': { 'title': 'Best of Gramatik+Proleter', 'channelTitle': 'Vlad Dascalu' }, 'status': { 'embeddable': 'true' }, 'contentDetails': { 'duration': 'PT1H8M23S' } }, { 'id': 'PwaYP81-0KE', 'snippet': { 'title': 'Gramatik - Street Bangerz Vol. 4 FULL ALBUM', 'channelTitle': 'Damzon Blazer' }, 'status': { 'embeddable': 'true' }, 'contentDetails': { 'duration': 'PT46M36S' } }, { 'id': 'ouHtMSs02tY', 'snippet': { 'title': 'Gramatik - RR Live : Les Plages Electroniques 2013 (powered by Glowbl)', 'channelTitle': 'Rider Radio' }, 'status': { 'embeddable': 'true' }, 'contentDetails': { 'duration': 'PT15M58S' } }, { 'id': 'BHBWlJg4uGY', 'snippet': { 'title': 'Gramatik - Balkan Express', 'channelTitle': 'Dimitris P' }, 'status': { 'embeddable': 'true' }, 'contentDetails': { 'duration': 'PT3M31S' } }, { 'id': 'jlJtJ1XNbJ8', 'snippet': { 'title': 'Gramatik -07- Like You Do (HQ)', 'channelTitle': 'PraiseTheeJah' }, 'status': { 'embeddable': 'true' }, 'contentDetails': { 'duration': 'PT4M32S' } }, { 'id': 'QQGEpKeR1Uc', 'snippet': { 'title': 'Gramatik - Lonely & Cold (Original Mix)', 'channelTitle': 'llukas1515' }, 'status': { 'embeddable': 'true' }, 'contentDetails': { 'duration': 'PT3M12S' } }, { 'id': 'fceBCkG3dfM', 'snippet': { 'title': 'Gramatik Ft. Exmag & Gibbz - We Used To Dream', 'channelTitle': 'prozete' }, 'status': { 'embeddable': 'true' }, 'contentDetails': { 'duration': 'PT4M12S' } }, { 'id': '6YNkE62Yxpo', 'snippet': { 'title': 'Gramatik vs. The Beatles - Don\'t Let Me Down', 'channelTitle': 'ngoht86' }, 'status': { 'embeddable': 'true' }, 'contentDetails': { 'duration': 'PT5M27S' } }, { 'id': 'QGBfUfaFtaM', 'snippet': { 'title': 'Gramatik - Somebody (new album)', 'channelTitle': 'mulicnik' }, 'status': { 'embeddable': 'true' }, 'contentDetails': { 'duration': 'PT5M2S' } }, { 'id': 'MSjkcdPN_Jg', 'snippet': { 'title': 'Gramatik - Lonely Cold', 'channelTitle': 'TheSoundYouNeed' }, 'status': { 'embeddable': 'true' }, 'contentDetails': { 'duration': 'PT3M12S' } }, { 'id': 'b9TLfF67Rq8', 'snippet': { 'title': 'Gramatik - Doin\' It (Original Mix)', 'channelTitle': 'nikos791' }, 'status': { 'embeddable': 'true' }, 'contentDetails': { 'duration': 'PT2M14S' } }, { 'id': 'esAamBCFgfM', 'snippet': { 'title': 'Gramatik - Življenje na cedilu (Lyrics)', 'channelTitle': 'Ðanki na Skanki' }, 'status': { 'embeddable': 'true' }, 'contentDetails': { 'duration': 'PT5M27S' } }, { 'id': '0H5EgF8Vjfs', 'snippet': { 'title': 'Gramatik - Brave Men Feat. Eskobars', 'channelTitle': 'Gramatikk' }, 'status': { 'embeddable': 'true' }, 'contentDetails': { 'duration': 'PT6M2S' } }, { 'id': 'pE_2INEqmQc', 'snippet': { 'title': 'Gramatik - It\'s Just A Ride', 'channelTitle': 'prozete' }, 'status': { 'embeddable': 'true' }, 'contentDetails': { 'duration': 'PT5M1S' } }, { 'id': 'j6JUlQvbdqM', 'snippet': { 'title': 'Gramatik -09- Somebody (HQ)', 'channelTitle': 'PraiseTheeJah' }, 'status': { 'embeddable': 'true' }, 'contentDetails': { 'duration': 'PT5M' } }, { 'id': 'mHX8lo1G8CU', 'snippet': { 'title': 'Gramatik- Day Of The So Called Glory', 'channelTitle': 'Wingert91' }, 'status': { 'embeddable': 'true' }, 'contentDetails': { 'duration': 'PT5M49S' } }, { 'id': 'HGOg-D1PtSc', 'snippet': { 'title': 'Gramatik - Cutting Room', 'channelTitle': 'The Lost Rabbit' }, 'status': { 'embeddable': 'true' }, 'contentDetails': { 'duration': 'PT2M7S' } }, { 'id': 'HShoVk4jsKE', 'snippet': { 'title': 'Gramatik - Blue Step', 'channelTitle': 'MOR Network' }, 'status': { 'embeddable': 'true' }, 'contentDetails': { 'duration': 'PT4M55S' } }, { 'id': 'md95KXppisA', 'snippet': { 'title': 'Gramatik - Torture Feat. Eric Krasno', 'channelTitle': 'Gramatikk' }, 'status': { 'embeddable': 'true' }, 'contentDetails': { 'duration': 'PT3M43S' } }, { 'id': 'h92ZT6BmQMo', 'snippet': { 'title': 'Gramatik - Tearin\' It Up', 'channelTitle': 'Holy Chill' }, 'status': { 'embeddable': 'true' }, 'contentDetails': { 'duration': 'PT4M24S' } }, { 'id': 'yxrTGMijT6k', 'snippet': { 'title': 'Gramatik - Unfallen Kingdom', 'channelTitle': 'ngoht86' }, 'status': { 'embeddable': 'true' }, 'contentDetails': { 'duration': 'PT3M51S' } }, { 'id': 'Wv2CEeoL08A', 'snippet': { 'title': 'Gramatik - Just Jammin\'', 'channelTitle': 'MusicTourOne' }, 'status': { 'embeddable': 'true' }, 'contentDetails': { 'duration': 'PT6M31S' } }, { 'id': 'K0pxDoJ6e6k', 'snippet': { 'title': 'Led Zeppelin Vs. Gramatik - Stairway To Hip-Hop Heaven', 'channelTitle': 'MelitaGista' }, 'status': { 'embeddable': 'true' }, 'contentDetails': { 'duration': 'PT3M37S' } }, { 'id': 'EKIrICNbFjU', 'snippet': { 'title': 'Gramatik-Bluestep', 'channelTitle': 'iLevon' }, 'status': { 'embeddable': 'true' }, 'contentDetails': { 'duration': 'PT4M55S' } }, { 'id': 'YfdtFqOK5Zc', 'snippet': { 'title': 'Gramatik - Got to be in all The Way', 'channelTitle': 'Music Planet' }, 'status': { 'embeddable': 'true' }, 'contentDetails': { 'duration': 'PT2M28S' } }, { 'id': '5Q_9KDM3pwo', 'snippet': { 'title': 'Gramatik - I\'m free', 'channelTitle': 'ngoht86' }, 'status': { 'embeddable': 'true' }, 'contentDetails': { 'duration': 'PT4M38S' } }, { 'id': 'kLgkVx1Dt-M', 'snippet': { 'title': '(HQ) Gramatik - Fist Up [Digital Freedom]', 'channelTitle': 'Sophistefunk' }, 'status': { 'embeddable': 'true' }, 'contentDetails': { 'duration': 'PT4M35S' } }, { 'id': 'nUOlnDD1uhs', 'snippet': { 'title': 'Gramatik - Brave Men', 'channelTitle': 'WorldwideFutureMusic' }, 'status': { 'embeddable': 'true' }, 'contentDetails': { 'duration': 'PT6M3S' } }, { 'id': 'nbb4Vvi5dVY', 'snippet': { 'title': 'Gramatik - Fist Up (HQ)', 'channelTitle': 'ann03071874' }, 'status': { 'embeddable': 'true' }, 'contentDetails': { 'duration': 'PT4M35S' } }, { 'id': 'xVYdwVEqIJY', 'snippet': { 'title': 'Gramatik - Bring It Fast', 'channelTitle': 'Holy Chill' }, 'status': { 'embeddable': 'true' }, 'contentDetails': { 'duration': 'PT2M51S' } }, { 'id': 'ZVQezLQ25qo', 'snippet': { 'title': 'Gramatik - Just Creepin\' | Street Bangerz #4', 'channelTitle': 'Seismicc Excursionn' }, 'status': { 'embeddable': 'true' }, 'contentDetails': { 'duration': 'PT3M22S' } }, { 'id': 'TGOPC_4RYDU', 'snippet': { 'title': '(HQ) Gramatik - While I Was Playin\' Fair [Beatz & Pieces Vol. 1]', 'channelTitle': 'Sophistefunk' }, 'status': { 'embeddable': 'true' }, 'contentDetails': { 'duration': 'PT4M6S' } }, { 'id': 'ju7ICGdu4O8', 'snippet': { 'title': 'Gramatik Interview | DJ TechTools', 'channelTitle': 'DJ TechTools' }, 'status': { 'embeddable': 'true' }, 'contentDetails': { 'duration': 'PT5M32S' } }, { 'id': '-IiJk7ud4D4', 'snippet': { 'title': 'Gramatik - Get A Grip Feat. Gibbz (FKJ Remix)', 'channelTitle': 'Bisquit Channel' }, 'status': { 'embeddable': 'true' }, 'contentDetails': { 'duration': 'PT4M12S' } }] });
                /* jshint ignore:end */
            });

            it('should return 50 songs', function(done) {
                YouTubeV3API.search({
                    text: 'Gramatik',
                    success: function(searchResponse) {
                        expect($.ajax.calledTwice).to.equal(true);
                        expect(searchResponse.songs).not.to.equal(null);
                        expect(searchResponse.songs.length).to.equal(50);
                        done();
                    }
                });
            });

            after(function() {
                $.ajax.restore();
            });
        });

        describe('when asked to find a playable song by title', function() {
            before(function() {
                /* jshint ignore:start */
                sinon.stub($, 'ajax')
                    .onFirstCall().yieldsTo('success', { 'items': [{ 'id': { 'videoId': 'o4_1hS1aIC8' } }, { 'id': { 'videoId': 'n4LxHI8uV9A' } }, { 'id': { 'videoId': 'FijBkSvN6N8' } }, { 'id': { 'videoId': 'jfwwxnDmNk4' } }, { 'id': { 'videoId': 'JmR7D2funBM' } }, { 'id': { 'videoId': 'RhdG5wE5FH4' } }, { 'id': { 'videoId': 'LA5SfGNZCrU' } }, { 'id': { 'videoId': 'h8KnTyqki-o' } }, { 'id': { 'videoId': 'zvQJnBgG0ew' } }, { 'id': { 'videoId': 'KTuKTt_CecU' } }, { 'id': { 'videoId': 'pYmel9dPL4k' } }, { 'id': { 'videoId': '_m2zGncgLjw' } }, { 'id': { 'videoId': 'mUnMOG8xKsg' } }, { 'id': { 'videoId': 'vrVuGiKRVDU' } }, { 'id': { 'videoId': 'lYKRPzOi1zI' } }, { 'id': { 'videoId': 'W9SBq_FwtEg' } }, { 'id': { 'videoId': 'bypGsd527dM' } }, { 'id': { 'videoId': 'PwaYP81-0KE' } }, { 'id': { 'videoId': 'ouHtMSs02tY' } }, { 'id': { 'videoId': 'BHBWlJg4uGY' } }, { 'id': { 'videoId': 'jlJtJ1XNbJ8' } }, { 'id': { 'videoId': 'QQGEpKeR1Uc' } }, { 'id': { 'videoId': 'fceBCkG3dfM' } }, { 'id': { 'videoId': '6YNkE62Yxpo' } }, { 'id': { 'videoId': 'QGBfUfaFtaM' } }, { 'id': { 'videoId': 'MSjkcdPN_Jg' } }, { 'id': { 'videoId': 'b9TLfF67Rq8' } }, { 'id': { 'videoId': 'esAamBCFgfM' } }, { 'id': { 'videoId': '0H5EgF8Vjfs' } }, { 'id': { 'videoId': 'pE_2INEqmQc' } }, { 'id': { 'videoId': 'j6JUlQvbdqM' } }, { 'id': { 'videoId': 'mHX8lo1G8CU' } }, { 'id': { 'videoId': 'HGOg-D1PtSc' } }, { 'id': { 'videoId': 'HShoVk4jsKE' } }, { 'id': { 'videoId': 'md95KXppisA' } }, { 'id': { 'videoId': 'h92ZT6BmQMo' } }, { 'id': { 'videoId': 'yxrTGMijT6k' } }, { 'id': { 'videoId': 'Wv2CEeoL08A' } }, { 'id': { 'videoId': 'K0pxDoJ6e6k' } }, { 'id': { 'videoId': 'EKIrICNbFjU' } }, { 'id': { 'videoId': 'YfdtFqOK5Zc' } }, { 'id': { 'videoId': '5Q_9KDM3pwo' } }, { 'id': { 'videoId': 'kLgkVx1Dt-M' } }, { 'id': { 'videoId': 'nUOlnDD1uhs' } }, { 'id': { 'videoId': 'nbb4Vvi5dVY' } }, { 'id': { 'videoId': 'xVYdwVEqIJY' } }, { 'id': { 'videoId': 'ZVQezLQ25qo' } }, { 'id': { 'videoId': 'TGOPC_4RYDU' } }, { 'id': { 'videoId': 'ju7ICGdu4O8' } }, { 'id': { 'videoId': '-IiJk7ud4D4' } }] })
                    .onSecondCall().yieldsTo('success', { 'items': [{ 'id': 'o4_1hS1aIC8', 'snippet': { 'title': 'Best of Gramatik HD', 'channelTitle': 'Stay See' }, 'status': { 'embeddable': 'true' }, 'contentDetails': { 'duration': 'PT1H19M42S' } }, { 'id': 'n4LxHI8uV9A', 'snippet': { 'title': 'Gramatik - Beatz & Pieces Vol.1 (2012)', 'channelTitle': 'nohipster6' }, 'status': { 'embeddable': 'true' }, 'contentDetails': { 'duration': 'PT1H14M25S' } }, { 'id': 'FijBkSvN6N8', 'snippet': { 'title': 'Gramatik - Street Bangerz Vol. 3 FULL ALBUM', 'channelTitle': 'Damzon Blazer' }, 'status': { 'embeddable': 'true' }, 'contentDetails': { 'duration': 'PT1H11M37S' } }, { 'id': 'jfwwxnDmNk4', 'snippet': { 'title': 'Gramatik - The Age Of Reason (FULL ALBUM)', 'channelTitle': 'FREEDM Collective' }, 'status': { 'embeddable': 'true' }, 'contentDetails': { 'duration': 'PT1H12M6S' } }, { 'id': 'JmR7D2funBM', 'snippet': { 'title': 'Gramatik - No Shortcuts FULL ALBUM', 'channelTitle': 'Damzon Blazer' }, 'status': { 'embeddable': 'true' }, 'contentDetails': { 'duration': 'PT1H19M11S' } }, { 'id': 'RhdG5wE5FH4', 'snippet': { 'title': 'Gramatik - The Age Of Reason FULL ALBUM', 'channelTitle': 'Damzon Blazer' }, 'status': { 'embeddable': 'true' }, 'contentDetails': { 'duration': 'PT1H12M8S' } }, { 'id': 'LA5SfGNZCrU', 'snippet': { 'title': 'Gramatik - Brave Men feat. Eskobars (Official Music Video)', 'channelTitle': 'Gramatikk' }, 'status': { 'embeddable': 'true' }, 'contentDetails': { 'duration': 'PT5M31S' } }, { 'id': 'h8KnTyqki-o', 'snippet': { 'title': 'Best of Gramatik - Chillout Funkstep Soul', 'channelTitle': 'Sylver Screen' }, 'status': { 'embeddable': 'true' }, 'contentDetails': { 'duration': 'PT1H19M44S' } }, { 'id': 'zvQJnBgG0ew', 'snippet': { 'title': 'Gramatik-The Age Of Reason 2014 (Full Album) (HQ)', 'channelTitle': 'Spyros Fyl' }, 'status': { 'embeddable': 'true' }, 'contentDetails': { 'duration': 'PT1H12M7S' } }, { 'id': 'KTuKTt_CecU', 'snippet': { 'title': 'Gramatik - Street Bangerz Vol. 2 FULL ALBUM', 'channelTitle': 'Damzon Blazer' }, 'status': { 'embeddable': 'true' }, 'contentDetails': { 'duration': 'PT1H21M21S' } }, { 'id': 'pYmel9dPL4k', 'snippet': { 'title': 'Gramatik - Street Bangerz Vol. 1 FULL ALBUM', 'channelTitle': 'Damzon Blazer' }, 'status': { 'embeddable': 'true' }, 'contentDetails': { 'duration': 'PT57M6S' } }, { 'id': '_m2zGncgLjw', 'snippet': { 'title': 'Gramatik - Hit That Jive (Original Mix)', 'channelTitle': 'Djphanton' }, 'status': { 'embeddable': 'true' }, 'contentDetails': { 'duration': 'PT3M26S' } }, { 'id': 'mUnMOG8xKsg', 'snippet': { 'title': 'Gramatik - Muy Tranquilo', 'channelTitle': 'n3mvo' }, 'status': { 'embeddable': 'true' }, 'contentDetails': { 'duration': 'PT3M55S' } }, { 'id': 'vrVuGiKRVDU', 'snippet': { 'title': 'Gramatik | No Way Out', 'channelTitle': 'DailyMorningMusic' }, 'status': { 'embeddable': 'true' }, 'contentDetails': { 'duration': 'PT4M24S' } }, { 'id': 'lYKRPzOi1zI', 'snippet': { 'title': 'Gramatik - Just Jammin', 'channelTitle': 'optionsC' }, 'status': { 'embeddable': 'true' }, 'contentDetails': { 'duration': 'PT6M40S' } }, { 'id': 'W9SBq_FwtEg', 'snippet': { 'title': 'Gramatik - In This Whole World', 'channelTitle': 'Holy Chill' }, 'status': { 'embeddable': 'true' }, 'contentDetails': { 'duration': 'PT3M55S' } }, { 'id': 'bypGsd527dM', 'snippet': { 'title': 'Best of Gramatik+Proleter', 'channelTitle': 'Vlad Dascalu' }, 'status': { 'embeddable': 'true' }, 'contentDetails': { 'duration': 'PT1H8M23S' } }, { 'id': 'PwaYP81-0KE', 'snippet': { 'title': 'Gramatik - Street Bangerz Vol. 4 FULL ALBUM', 'channelTitle': 'Damzon Blazer' }, 'status': { 'embeddable': 'true' }, 'contentDetails': { 'duration': 'PT46M36S' } }, { 'id': 'ouHtMSs02tY', 'snippet': { 'title': 'Gramatik - RR Live : Les Plages Electroniques 2013 (powered by Glowbl)', 'channelTitle': 'Rider Radio' }, 'status': { 'embeddable': 'true' }, 'contentDetails': { 'duration': 'PT15M58S' } }, { 'id': 'BHBWlJg4uGY', 'snippet': { 'title': 'Gramatik - Balkan Express', 'channelTitle': 'Dimitris P' }, 'status': { 'embeddable': 'true' }, 'contentDetails': { 'duration': 'PT3M31S' } }, { 'id': 'jlJtJ1XNbJ8', 'snippet': { 'title': 'Gramatik -07- Like You Do (HQ)', 'channelTitle': 'PraiseTheeJah' }, 'status': { 'embeddable': 'true' }, 'contentDetails': { 'duration': 'PT4M32S' } }, { 'id': 'QQGEpKeR1Uc', 'snippet': { 'title': 'Gramatik - Lonely & Cold (Original Mix)', 'channelTitle': 'llukas1515' }, 'status': { 'embeddable': 'true' }, 'contentDetails': { 'duration': 'PT3M12S' } }, { 'id': 'fceBCkG3dfM', 'snippet': { 'title': 'Gramatik Ft. Exmag & Gibbz - We Used To Dream', 'channelTitle': 'prozete' }, 'status': { 'embeddable': 'true' }, 'contentDetails': { 'duration': 'PT4M12S' } }, { 'id': '6YNkE62Yxpo', 'snippet': { 'title': 'Gramatik vs. The Beatles - Don\'t Let Me Down', 'channelTitle': 'ngoht86' }, 'status': { 'embeddable': 'true' }, 'contentDetails': { 'duration': 'PT5M27S' } }, { 'id': 'QGBfUfaFtaM', 'snippet': { 'title': 'Gramatik - Somebody (new album)', 'channelTitle': 'mulicnik' }, 'status': { 'embeddable': 'true' }, 'contentDetails': { 'duration': 'PT5M2S' } }, { 'id': 'MSjkcdPN_Jg', 'snippet': { 'title': 'Gramatik - Lonely Cold', 'channelTitle': 'TheSoundYouNeed' }, 'status': { 'embeddable': 'true' }, 'contentDetails': { 'duration': 'PT3M12S' } }, { 'id': 'b9TLfF67Rq8', 'snippet': { 'title': 'Gramatik - Doin\' It (Original Mix)', 'channelTitle': 'nikos791' }, 'status': { 'embeddable': 'true' }, 'contentDetails': { 'duration': 'PT2M14S' } }, { 'id': 'esAamBCFgfM', 'snippet': { 'title': 'Gramatik - Življenje na cedilu (Lyrics)', 'channelTitle': 'Ðanki na Skanki' }, 'status': { 'embeddable': 'true' }, 'contentDetails': { 'duration': 'PT5M27S' } }, { 'id': '0H5EgF8Vjfs', 'snippet': { 'title': 'Gramatik - Brave Men Feat. Eskobars', 'channelTitle': 'Gramatikk' }, 'status': { 'embeddable': 'true' }, 'contentDetails': { 'duration': 'PT6M2S' } }, { 'id': 'pE_2INEqmQc', 'snippet': { 'title': 'Gramatik - It\'s Just A Ride', 'channelTitle': 'prozete' }, 'status': { 'embeddable': 'true' }, 'contentDetails': { 'duration': 'PT5M1S' } }, { 'id': 'j6JUlQvbdqM', 'snippet': { 'title': 'Gramatik -09- Somebody (HQ)', 'channelTitle': 'PraiseTheeJah' }, 'status': { 'embeddable': 'true' }, 'contentDetails': { 'duration': 'PT5M' } }, { 'id': 'mHX8lo1G8CU', 'snippet': { 'title': 'Gramatik- Day Of The So Called Glory', 'channelTitle': 'Wingert91' }, 'status': { 'embeddable': 'true' }, 'contentDetails': { 'duration': 'PT5M49S' } }, { 'id': 'HGOg-D1PtSc', 'snippet': { 'title': 'Gramatik - Cutting Room', 'channelTitle': 'The Lost Rabbit' }, 'status': { 'embeddable': 'true' }, 'contentDetails': { 'duration': 'PT2M7S' } }, { 'id': 'HShoVk4jsKE', 'snippet': { 'title': 'Gramatik - Blue Step', 'channelTitle': 'MOR Network' }, 'status': { 'embeddable': 'true' }, 'contentDetails': { 'duration': 'PT4M55S' } }, { 'id': 'md95KXppisA', 'snippet': { 'title': 'Gramatik - Torture Feat. Eric Krasno', 'channelTitle': 'Gramatikk' }, 'status': { 'embeddable': 'true' }, 'contentDetails': { 'duration': 'PT3M43S' } }, { 'id': 'h92ZT6BmQMo', 'snippet': { 'title': 'Gramatik - Tearin\' It Up', 'channelTitle': 'Holy Chill' }, 'status': { 'embeddable': 'true' }, 'contentDetails': { 'duration': 'PT4M24S' } }, { 'id': 'yxrTGMijT6k', 'snippet': { 'title': 'Gramatik - Unfallen Kingdom', 'channelTitle': 'ngoht86' }, 'status': { 'embeddable': 'true' }, 'contentDetails': { 'duration': 'PT3M51S' } }, { 'id': 'Wv2CEeoL08A', 'snippet': { 'title': 'Gramatik - Just Jammin\'', 'channelTitle': 'MusicTourOne' }, 'status': { 'embeddable': 'true' }, 'contentDetails': { 'duration': 'PT6M31S' } }, { 'id': 'K0pxDoJ6e6k', 'snippet': { 'title': 'Led Zeppelin Vs. Gramatik - Stairway To Hip-Hop Heaven', 'channelTitle': 'MelitaGista' }, 'status': { 'embeddable': 'true' }, 'contentDetails': { 'duration': 'PT3M37S' } }, { 'id': 'EKIrICNbFjU', 'snippet': { 'title': 'Gramatik-Bluestep', 'channelTitle': 'iLevon' }, 'status': { 'embeddable': 'true' }, 'contentDetails': { 'duration': 'PT4M55S' } }, { 'id': 'YfdtFqOK5Zc', 'snippet': { 'title': 'Gramatik - Got to be in all The Way', 'channelTitle': 'Music Planet' }, 'status': { 'embeddable': 'true' }, 'contentDetails': { 'duration': 'PT2M28S' } }, { 'id': '5Q_9KDM3pwo', 'snippet': { 'title': 'Gramatik - I\'m free', 'channelTitle': 'ngoht86' }, 'status': { 'embeddable': 'true' }, 'contentDetails': { 'duration': 'PT4M38S' } }, { 'id': 'kLgkVx1Dt-M', 'snippet': { 'title': '(HQ) Gramatik - Fist Up [Digital Freedom]', 'channelTitle': 'Sophistefunk' }, 'status': { 'embeddable': 'true' }, 'contentDetails': { 'duration': 'PT4M35S' } }, { 'id': 'nUOlnDD1uhs', 'snippet': { 'title': 'Gramatik - Brave Men', 'channelTitle': 'WorldwideFutureMusic' }, 'status': { 'embeddable': 'true' }, 'contentDetails': { 'duration': 'PT6M3S' } }, { 'id': 'nbb4Vvi5dVY', 'snippet': { 'title': 'Gramatik - Fist Up (HQ)', 'channelTitle': 'ann03071874' }, 'status': { 'embeddable': 'true' }, 'contentDetails': { 'duration': 'PT4M35S' } }, { 'id': 'xVYdwVEqIJY', 'snippet': { 'title': 'Gramatik - Bring It Fast', 'channelTitle': 'Holy Chill' }, 'status': { 'embeddable': 'true' }, 'contentDetails': { 'duration': 'PT2M51S' } }, { 'id': 'ZVQezLQ25qo', 'snippet': { 'title': 'Gramatik - Just Creepin\' | Street Bangerz #4', 'channelTitle': 'Seismicc Excursionn' }, 'status': { 'embeddable': 'true' }, 'contentDetails': { 'duration': 'PT3M22S' } }, { 'id': 'TGOPC_4RYDU', 'snippet': { 'title': '(HQ) Gramatik - While I Was Playin\' Fair [Beatz & Pieces Vol. 1]', 'channelTitle': 'Sophistefunk' }, 'status': { 'embeddable': 'true' }, 'contentDetails': { 'duration': 'PT4M6S' } }, { 'id': 'ju7ICGdu4O8', 'snippet': { 'title': 'Gramatik Interview | DJ TechTools', 'channelTitle': 'DJ TechTools' }, 'status': { 'embeddable': 'true' }, 'contentDetails': { 'duration': 'PT5M32S' } }, { 'id': '-IiJk7ud4D4', 'snippet': { 'title': 'Gramatik - Get A Grip Feat. Gibbz (FKJ Remix)', 'channelTitle': 'Bisquit Channel' }, 'status': { 'embeddable': 'true' }, 'contentDetails': { 'duration': 'PT4M12S' } }] });
                /* jshint ignore:end */
            });

            it('should return a playable result', function(done) {
                YouTubeV3API.getSongByTitle({
                    title: 'Gramatik',
                    success: function(response) {
                        expect($.ajax.calledTwice).to.equal(true);
                        expect(response).not.to.equal(null);
                        expect(response.get('author')).to.equal('Stay See');
                        expect(response.get('duration')).to.equal(4782);
                        expect(response.get('id')).to.equal('o4_1hS1aIC8');
                        expect(response.get('title')).to.equal('Best of Gramatik HD');
                        done();
                    }
                });
            });

            after(function() {
                $.ajax.restore();
            });
        });

        describe('when asked to get related song information', function() {
            before(function() {
                /* jshint ignore:start */
                sinon.stub($, 'ajax')
                    .onFirstCall().yieldsTo('success', { 'items': [{ 'id': { 'videoId': 'K0pxDoJ6e6k' } }, { 'id': { 'videoId': 'E-loBDucBMg' } }, { 'id': { 'videoId': 'J-ZjzTKiG4M' } }, { 'id': { 'videoId': 'na8F9nQRbmI' } }, { 'id': { 'videoId': 'EotNGPBu4GY' } }] })
                    .onSecondCall().yieldsTo('success', { 'items': [{ 'id': 'K0pxDoJ6e6k', 'snippet': { 'title': 'Led Zeppelin Vs. Gramatik - Stairway To Hip-Hop Heaven', 'channelTitle': 'MelitaGista' }, 'status': { 'embeddable': 'true' }, 'contentDetails': { 'duration': 'PT3M37S' } }, { 'id': 'E-loBDucBMg', 'snippet': { 'title': 'Penalty - Denmark vs Germany', 'channelTitle': 'orbanleviii' }, 'status': { 'embeddable': 'true' }, 'contentDetails': { 'duration': 'PT14M44S' } }, { 'id': 'J-ZjzTKiG4M', 'snippet': { 'title': 'Led Zeppelin / Gramatik - Stairway To Hip-Hop Heaven', 'channelTitle': 'Wata Fonk' }, 'status': { 'embeddable': 'true' }, 'contentDetails': { 'duration': 'PT3M37S' } }, { 'id': 'na8F9nQRbmI', 'snippet': { 'title': 'Gramatik - #digitalfreedom [FULL EP] [UNCOMPRESSED AUDIO]', 'channelTitle': 'Juxtapo' }, 'status': { 'embeddable': 'true' }, 'contentDetails': { 'duration': 'PT32M21S' } }, { 'id': 'EotNGPBu4GY', 'snippet': { 'title': 'The Beatles - Lucy in the Sky with Diamonds (Rhythm Scholar Remix)', 'channelTitle': 'Rhythm Scholar' }, 'status': { 'embeddable': 'true' }, 'contentDetails': { 'duration': 'PT4M37S' } }] });
                /* jshint ignore:end */
            });

            it('should return related song information', function(done) {
                YouTubeV3API.getRelatedSongs({
                    songId: 'CxHFnVCZDRo',
                    success: function(songs) {
                        expect($.ajax.calledTwice).to.equal(true);
                        expect(songs).not.to.equal(null);
                        expect(songs.length).to.equal(5);
                        done();
                    }
                });
            });

            after(function() {
                $.ajax.restore();
            });
        });

        describe('when asked to get a channel\'s upload\'s playlistId', function() {
            var uploadsPlaylistId = 'UU_Gkp1Oa7e2a8NNaf5-KCpA';

            beforeEach(function() {
                sinon.stub($, 'ajax').yieldsTo('success', {
                    items: [{
                        contentDetails: {
                            relatedPlaylists: {
                                uploads: uploadsPlaylistId
                            }
                        }
                    }]
                });
            });

            afterEach(function() {
                $.ajax.restore();
            });

            it('should return an uploads playlist when asked for by channel name', function(done) {
                YouTubeV3API.getChannelUploadsPlaylistId({
                    forUsername: 'goodguygarry',
                    success: function(response) {
                        expect(response).not.to.equal(null);
                        expect(response.uploadsPlaylistId).to.equal(uploadsPlaylistId);
                        done();
                    }
                });
            });

            it('should return an uploads playlist when asked for by channel id', function(done) {
                YouTubeV3API.getChannelUploadsPlaylistId({
                    id: 'UC_Gkp1Oa7e2a8NNaf5-KCpA',
                    success: function(response) {
                        expect(response).not.to.equal(null);
                        expect(response.uploadsPlaylistId).to.equal(uploadsPlaylistId);
                        done();
                    }
                });
            });
        });

        describe('when asked to get a song by songId', function() {
            var songTitle = 'Danger - 22h39';
            var songId = 'MKS8Jn_3bnA';

            beforeEach(function() {
                sinon.stub($, 'ajax').yieldsTo('success', {
                    items: [{
                        contentDetails: {
                            duration: 'PT4M33S'
                        },
                        id: songId,
                        snippet: {
                            channelTitle: 'jlmaha5',
                            title: songTitle
                        },
                        status: {
                            embeddable: true
                        }
                    }]
                });
            });

            afterEach(function() {
                $.ajax.restore();
            });

            it('should return the song', function(done) {
                YouTubeV3API.getSong({
                    songId: 'MKS8Jn_3bnA',
                    success: function(song) {
                        expect(song instanceof Backbone.Model).to.equal(true);
                        expect(song.get('title')).to.equal(songTitle);
                        expect(song.get('id')).to.equal(songId);
                        done();
                    }
                });
            });
        });

        describe('when asked to get a title of a playlist', function() {
            var playlistTitle = 'Favorites';
            beforeEach(function() {
                sinon.stub($, 'ajax').yieldsTo('success', {
                    items: [{
                        snippet: {
                            title: playlistTitle
                        }
                    }]
                });
            });

            afterEach(function() {
                $.ajax.restore();
            });

            it('should return the title of the playlist', function(done) {
                YouTubeV3API.getTitle({
                    serviceType: YouTubeServiceType.Playlists,
                    id: 'FL_Gkp1Oa7e2a8NNaf5-KCpA',
                    success: function(response) {
                        expect(response).to.equal(playlistTitle);
                        done();
                    }
                });
            });
        });

        describe('when asked to get a title of a channel', function() {
            var channelTitle = 'Good Guy Garry';
            beforeEach(function() {
                sinon.stub($, 'ajax').yieldsTo('success', {
                    items: [{
                        snippet: {
                            title: channelTitle
                        }
                    }]
                });
            });

            afterEach(function() {
                $.ajax.restore();
            });

            it('should return the title of the channel by id', function(done) {
                YouTubeV3API.getTitle({
                    serviceType: YouTubeServiceType.Channels,
                    id: 'UC_Gkp1Oa7e2a8NNaf5-KCpA',
                    success: function(response) {
                        expect(response).to.equal(channelTitle);
                        done();
                    }
                });
            });

            it('should return the title of the channel by forUsername', function(done) {
                YouTubeV3API.getTitle({
                    serviceType: YouTubeServiceType.Channels,
                    forUsername: 'goodguygarry',
                    success: function(response) {
                        expect(response).to.equal(channelTitle);
                        done();
                    }
                });
            });
        });

        describe('when asked to get the title of an invalid playlist', function() {
            beforeEach(function() {
                sinon.stub($, 'ajax').yieldsTo('success', {
                    items: []
                });
            });

            afterEach(function() {
                $.ajax.restore();
            });

            it('should return error message', function(done) {
                YouTubeV3API.getTitle({
                    serviceType: YouTubeServiceType.Playlists,
                    id: 'Sharthstone/playlists',
                    error: function(response) {
                        expect(response).to.equal(chrome.i18n.getMessage('errorLoadingTitle'));
                        done();
                    }
                });
            });
        });

        describe('when asked to get playlist items from a YouTube favorites playlist', function() {
            beforeEach(function() {
                sinon.stub($, 'ajax').onFirstCall().yieldsTo('success', {
                    items: [{
                        contentDetails: {
                            videoId: '0Foctr1XCHE'
                        }
                    }]
                }).onSecondCall().yieldsTo('success', {
                    items: [{
                        contentDetails: {
                            duration: 'PT4M33S'
                        },
                        id: '0Foctr1XCHE',
                        snippet: {
                            channelTitle: 'Favorites',
                            title: 'Best League Hacks Glitches and bugs Part 1'
                        },
                        status: {
                            embeddable: true
                        }
                    }]
                });
            });

            afterEach(function() {
                $.ajax.restore();
            });

            it('should return a list of playlist items', function(done) {
                YouTubeV3API.getPlaylistSongs({
                    playlistId: 'FL_Gkp1Oa7e2a8NNaf5-KCpA',
                    success: function(response) {
                        expect(response).not.to.equal(null);
                        expect(response.songs.length).to.equal(1);
                        done();
                    }
                });
            });
        });

        describe('when asked to get information on a song which is unavailable', function() {
            beforeEach(function() {
                sinon.stub($, 'ajax').yieldsTo('success', {
                    items: []
                });
            });

            afterEach(function() {
                $.ajax.restore();
            });

            it('should throw an error indicating no song found', function(done) {
                YouTubeV3API.getSong({
                    songId: 'JMPYmNINxrE',
                    error: function(error) {
                        expect(error).not.to.equal(null);
                        expect(error).to.equal('Failed to find song JMPYmNINxrE');
                        done();
                    }
                });
            });
        });
    });
});