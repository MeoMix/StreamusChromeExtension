define([
    'text!../template/saveSelectedPrompt.htm',
    'genericPromptView',
    'folders',
    'videoSearchResults'
], function (SaveSelectedPromptTemplate, GenericPromptView, Folders, VideoSearchResults) {
    'use strict';

    var SaveSelectedPromptView = GenericPromptView.extend({

        className: GenericPromptView.prototype.className + ' saveSelectedPrompt',

        template: _.template(SaveSelectedPromptTemplate),

        events: _.extend({}, GenericPromptView.prototype.events, {
            
        }),
        
        render: function () {

            GenericPromptView.prototype.render.call(this, {
                'selectedResultsCount': VideoSearchResults.selected().count
            }, arguments);

            var playlistOptions = Folders.getActiveFolder().get('playlists').map(function (playlist) {
                return {
                    id: playlist.get('id'),
                    title: playlist.get('title')
                };
            });


            this.$el.find('select.submittable').selectize({
                //  If false, items created by the user will not show up as available options once they are unselected.
                persist: false,
                maxItems: 1,
                mode: 'multi',
                //  The name of the property to use as the "value" when an item is selected.
                valueField: 'id',
                //  The name of the property to render as an option / item label.
                labelField: 'title',
                //  An array of property names to analyze when filtering options.
                searchField: ['title'],
                options: playlistOptions,
                render: {
                    item: function (item, escape) {
                        
                        return '<div>' +
                            (item.title ? '<span class="name">' + escape(item.title) + '</span>' : '') +
                        '</div>';
                        
                    },
                    option: function (item, escape) {

                        var caption = "Caption TODO";

                        return '<div>' +
                            '<span class="label">' + escape(item.title) + '</span>' +
                            (caption ? '<span class="caption">' + escape(caption) + '</span>' : '') +
                        '</div>';
                    }
                },
                create: function (input) {

                    var createResult = false;
                    var trimmedInput = $.trim(input);
                    
                    if (trimmedInput != '') {
                        createResult = {
                            name: trimmedInput
                        };
                    }

                    return createResult;
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