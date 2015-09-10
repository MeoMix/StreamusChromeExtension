System.config({
  baseURL: "/",
  defaultJSExtensions: true,
  transpiler: "babel",
  babelOptions: {
    "optional": [
      "runtime",
      "optimisation.modules.system"
    ]
  },
  paths: {
    "background/*": "js/background/*",
    "common/*": "js/common/*",
    "contentScript/*": "js/contentScript/*",
    "foreground/*": "js/foreground/*",
    "test/*": "js/test/*",
    "lib/*": "js/lib/*",
    "github:*": "js/lib/jspm_packages/github/*",
    "npm:*": "js/lib/jspm_packages/npm/*"
  },

  map: {
    "babel": "npm:babel-core@5.8.23",
    "babel-runtime": "npm:babel-runtime@5.8.20",
    "backbone": "npm:backbone@1.1.2",
    "backbone.babysitter": "github:marionettejs/backbone.babysitter@0.1.10",
    "backbone.cocktail": "npm:backbone.cocktail@0.5.10",
    "backbone.wreqr": "github:marionettejs/backbone.wreqr@1.3.5",
    "chai": "npm:chai@3.2.0",
    "core-js": "npm:core-js@1.1.4",
    "handlebars": "github:components/handlebars.js@4.0.2",
    "hbs": "github:davis/plugin-hbs@1.1.0",
    "jquery": "github:components/jquery@2.1.4",
    "lodash": "npm:lodash@3.10.1",
    "marionette": "github:marionettejs/backbone.marionette@2.4.2",
    "mocha": "npm:mocha@2.3.1",
    "process": "npm:process@0.11.1",
    "sinon": "npm:sinon@1.16.1",
    "github:davis/plugin-hbs@1.1.0": {
      "handlebars": "github:components/handlebars.js@4.0.2"
    },
    "github:jspm/nodelibs-assert@0.1.0": {
      "assert": "npm:assert@1.3.0"
    },
    "github:jspm/nodelibs-buffer@0.1.0": {
      "buffer": "npm:buffer@3.4.3"
    },
    "github:jspm/nodelibs-process@0.1.1": {
      "process": "npm:process@0.10.1"
    },
    "github:jspm/nodelibs-util@0.1.0": {
      "util": "npm:util@0.10.3"
    },
    "npm:assert@1.3.0": {
      "util": "npm:util@0.10.3"
    },
    "npm:babel-runtime@5.8.20": {
      "process": "github:jspm/nodelibs-process@0.1.1"
    },
    "npm:buffer@3.4.3": {
      "base64-js": "npm:base64-js@0.0.8",
      "ieee754": "npm:ieee754@1.1.6",
      "is-array": "npm:is-array@1.0.1"
    },
    "npm:chai@3.2.0": {
      "assertion-error": "npm:assertion-error@1.0.1",
      "buffer": "github:jspm/nodelibs-buffer@0.1.0",
      "deep-eql": "npm:deep-eql@0.1.3",
      "process": "github:jspm/nodelibs-process@0.1.1",
      "systemjs-json": "github:systemjs/plugin-json@0.1.0",
      "type-detect": "npm:type-detect@1.0.0"
    },
    "npm:core-js@1.1.4": {
      "fs": "github:jspm/nodelibs-fs@0.1.2",
      "process": "github:jspm/nodelibs-process@0.1.1",
      "systemjs-json": "github:systemjs/plugin-json@0.1.0"
    },
    "npm:deep-eql@0.1.3": {
      "buffer": "github:jspm/nodelibs-buffer@0.1.0",
      "type-detect": "npm:type-detect@0.1.1"
    },
    "npm:formatio@1.1.1": {
      "process": "github:jspm/nodelibs-process@0.1.1",
      "samsam": "npm:samsam@1.1.2"
    },
    "npm:inherits@2.0.1": {
      "util": "github:jspm/nodelibs-util@0.1.0"
    },
    "npm:lodash@3.10.1": {
      "process": "github:jspm/nodelibs-process@0.1.1"
    },
    "npm:mocha@2.3.1": {
      "css": "github:systemjs/plugin-css@0.1.16"
    },
    "npm:process@0.11.1": {
      "assert": "github:jspm/nodelibs-assert@0.1.0"
    },
    "npm:sinon@1.16.1": {
      "formatio": "npm:formatio@1.1.1",
      "lolex": "npm:lolex@1.3.1",
      "process": "github:jspm/nodelibs-process@0.1.1",
      "samsam": "npm:samsam@1.1.2",
      "util": "npm:util@0.10.3"
    },
    "npm:util@0.10.3": {
      "inherits": "npm:inherits@2.0.1",
      "process": "github:jspm/nodelibs-process@0.1.1"
    }
  }
});
