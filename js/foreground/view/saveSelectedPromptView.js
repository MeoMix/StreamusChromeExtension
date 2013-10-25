define([
    'text!../template/saveSelectedPrompt.htm',
    'genericPromptView',
    'folders'
], function (SaveSelectedPromptTemplate, GenericPromptView, Folders) {
    'use strict';

    var SaveSelectedPromptView = GenericPromptView.extend({

        className: GenericPromptView.prototype.className + ' saveSelectedPrompt',

        template: _.template(SaveSelectedPromptTemplate),

        events: _.extend({}, GenericPromptView.prototype.events, {
            
        }),
        
        render: function () {

            GenericPromptView.prototype.render.call(this, {
            }, arguments);

            var playlistOptions = Folders.getActiveFolder().get('playlists').map(function (playlist) {
                return {
                    id: playlist.get('id'),
                    title: playlist.get('title')
                };
            });

            //this.$el.find('select.submittable').selectize({
            //    //  If false, items created by the user will not show up as available options once they are unselected.
            //    persist: false,
            //    maxItems: 1,
            //    //  The name of the property to use as the "value" when an item is selected.
            //    valueField: 'id',
            //    //  The name of the property to render as an option / item label.
            //    labelField: 'title',
            //    //  An array of property names to analyze when filtering options.
            //    searchField: ['title'],
            //    options: playlistOptions
            //});
            
            var REGEX_EMAIL = '([a-z0-9!#$%&\'*+/=?^_`{|}~-]+(?:\.[a-z0-9!#$%&\'*+/=?^_`{|}~-]+)*@' +
                  '(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])?)';

            this.$el.find('select.submittable').selectize({
                persist: false,
                maxItems: null,
                valueField: 'email',
                labelField: 'name',
                searchField: ['name', 'email'],
                options: [
                    { email: 'brian@thirdroute.com', name: 'Brian Reavis' },
                    { email: 'nikola@tesla.com', name: 'Nikola Tesla' },
                    { email: 'someone@gmail.com' }
                ],
                render: {
                    item: function (item, escape) {
                        return '<div>' +
                            (item.name ? '<span class="name">' + escape(item.name) + '</span>' : '') +
                            (item.email ? '<span class="email">' + escape(item.email) + '</span>' : '') +
                        '</div>';
                    },
                    option: function (item, escape) {
                        var label = item.name || item.email;
                        var caption = item.name ? item.email : null;
                        return '<div>' +
                            '<span class="label">' + escape(label) + '</span>' +
                            (caption ? '<span class="caption">' + escape(caption) + '</span>' : '') +
                        '</div>';
                    }
                },
                create: function (input) {
                    if ((new RegExp('^' + REGEX_EMAIL + '$', 'i')).test(input)) {
                        return { email: input };
                    }
                    var match = input.match(new RegExp('^([^<]*)\<' + REGEX_EMAIL + '\>$', 'i'));
                    if (match) {
                        return {
                            email: match[2],
                            name: $.trim(match[1])
                        };
                    }
                    alert('Invalid email address.');
                    return false;
                }
            });

            return this;
        },
        
        initialize: function () {
        },
        
        doOk: function () {

        }
        
    });

    return SaveSelectedPromptView;
});