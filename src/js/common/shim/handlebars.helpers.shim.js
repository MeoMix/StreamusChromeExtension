import Handlebars from 'handlebars';

// Provide handlebars with the ability to look up a model's attributes from within a template.
Handlebars.registerHelper('get', function(model, attribute) {
  return model.get(attribute);
});

Handlebars.registerHelper('ternary', function(test, yes, no) {
  return test ? yes : no;
});

Handlebars.registerHelper('i18n', function(messageName) {
  var message = chrome.i18n.getMessage(messageName);

  if (message === '') {
    throw new Error('Failed to find message: ' + messageName);
  }

  return chrome.i18n.getMessage(messageName);
});