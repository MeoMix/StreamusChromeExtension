## JavaScript Coding Conventions Guide

This is not intended to be a comprehensive list. If a situation is not described in this guide, use common best practices such as the [Google JavaScript Style Guide](https://google-styleguide.googlecode.com/svn/trunk/javascriptguide.xml). 

## Coding Style

- No tabs. Two spaces.
- No trailing whitespace.
- Attempt to keep lines fewer than 120 characters.
- Always use semicolons and don't rely on implicit insertion.
- Single quotes. Double quotes are OK only when nested within single quotes.
```
# good
var foo = 'Hello, world.';
var bar = 'Hello, "world."';
# bad
var foo = "Hello, world.";
```
- Functions are followed by no space.
```
# good
function foo() {
    ...
}
# bad
function foo () {
    ...
}
```
- Argument definitions are followed by no spaces.
```
# good
function foo(a, b, c) {
    ...
}
# bad
function foo( a, b, c ) {
    ...
}
```
- A single space will always and should only follow semi-colons when defining object literals.
```
# good
var foo = {
    bar: 1
}
# bad
var foo = {
    bar : 1
}
var foo = {
    bar:1
}
```
- A single space will always follow conditional statements.
```
# good
if (true) {
   ...
}
# bad
if(true) {
   ...
}
if(true){
   ...
}
```
- Never declare multiple variables with a single `var` statement.
```
# good
var foo = null;
var bar = null;
# bad
var foo, bar = null;
```
- Always throw errors, not strings.
```
# good
throw new Error('foo');
# bad
throw 'foo';
```

## Code Comments

- Comments should explain "why" not "what".
- Less can be more with comments. Encourage yourself to re-read comments after writing them and see if you can convey the same thought more succinctly.
- Custom methods (private or public) should each have a summary unless their function is blindingly obvious.
- Backbone/Marionette method overrides should not have summary comments. For instance, `onRender` does not need a comment explaining that it is called when the view is rendered.
- Hacks, workarounds, uncommon patterns, etc. should have an explanation of why they are necessary. Provide links for copy/pasted code source(s).
- Use proper sentences.

## Variable Names

### General Variable Names

- Variable names must not be [reserved words or identifiers](http://www.javascripter.net/faq/reserved.htm).
- Method names must not be reserved Backbone/Marionette names, unless the intent is to override the method. Common method names collisions are: `_onCollectionAdd`, `_onCollectionRemove`, and `_ensureElement`.
- Variable names should use camel-casing. Example: `coffeeMug`. 
- Only constructors and constants should begin with an upper-case letter. Example: `CoffeePot`.
- Function names should describe the intent of the function, not how the function is called. Example: `makeCoffee` instead of `pushStartButton`.
- Private properties/methods should be prefixed with `_`. Example: `_brewCoffee`.
- Methods that return a value should be prefixed with `get`. Example: `getCoffee`.
- Methods that set a property/attribute should be prefixed with `set`. Example: `setCoffeeTemperature`.
- Booleans should be prefixed with `is`, `are`, `has`, etc. Example: `isCoffeeReady`.
- Use "positive" names instead of "negative" names. Example: `isEnabled` instead of `isDisabled`.
- jQuery objects should be prefixed with `$`. Example: `$coffeeOrderForm`.
- Event handlers should begin with `on`, then the event name, then the name of the object. Example: `onDrinkCoffee`.

### Backbone/Marionette Variable Names

- Marionette Views should be postfixed with 'View'. Example: `CoffeeCupView`.
- Marionette Behaviors should be postfixed with `Behavior`. Example: `liquidBehavior`.
- Marionette Regions should be postfixed with `Region`. Example: `cupHolderRegion`.
- Backbone Collections should be plural. Example: `CoffeeCups`.
- Backbone Models should be singular. Example: `CoffeeBean`.

## Code Organization

### General Code Organization

- Only define one module per file.
- Properties and methods should be private unless they need to be accessed by an external module.
- Prefer Lo-Dash methods over native implementations except when working inside content scripts (which do not have access to Lo-Dash).
- Do not commit blocks of commented-out code.
- Do not commit `console` statements nor `TODO` statements. Create GitHub issues for TODO statements and reference the issue at the given location.

### Backbone/Marionette Code Organization

- Backbone/Marionette modules should be organized in the following order:
    1. Backbone/Marionette properties.
    2. Custom properties.
    3. Backbone/Marionette methods, in the order in which they are called.
    4. Public methods.
    5. Private event handlers.
    6. Private methods.
- Event handlers named according to their event/object should not contain functional code. They should call methods named according to their function.
    - Example: `onDrinkCoffee` should call `typeMuchCode` and then `crash`, rather than having the contents of those methods within `onDrinkCoffee` itself.
- Custom instance-scope variables should be initialized in `initialize()` (or a custom method called from `initialize`).
- Do not reference a view's options outside of `initialize`
- Backbone model attributes should be defined in `defaults`. Use a function instead of object for `defaults` if the properties are non-primitive types.
- Prefer Marionette Behaviors instead of mixins/inheritance for Marionette views.
- Keep Marionette templates as simple as possible. Never call a function from a template - mix the value into the template via `templateHelpers`

## Event Handling

- UI events should not directly affect view state. Instead, they should affect Backbone model state, which triggers changes to the view state.
- Use Marionette's `events`, `modelEvents`, and `collectionEvents`.
- Leverage `bindEntityEvents` when binding several events to a non-model/non-collection object.
- Prefer using Backbone's `listenTo()` instead of `on()`. Models and collections may use `on()` when listening to their own events.
- Use `addEventListener` when binding to `window`.
- Prefer declaring event bindings in `initialize` whenever it is practical.
- `$.on()` and `addEventListener` should have a associated `$.off()` and `removeEventListener` calls in destructors such as `onBeforeDestroy`.
- Custom events and triggers should be avoided if possible. There is probably a Backbone/Marionette event that suits your needs.

## Misc

- Don't use `parseInt` without radix. Example: `parseInt(x)` should be `parseInt(x, 10)` or `_.parseInt(x)`.
- Use `_.isUndefined` and/or `_.isNull` (and understand the difference).
- Use objects as enumerations to define constants. Enumeration values should be strings, not integers, for readability.
- Avoid magic numbers. Assign the numbers to named variables.
- Never use the DOM's state for code flow. Store the state of the DOM in models and/or properties.
- `setter` methods should not return a value.
- `getter` methods should not change any state.
- Globals should never be used except when explicitly needed for interfacing with third-party libraries.
- Always oblige JSCS, JSHint, and Recess. If you disagree with a coding style rule then talk to @MeoMix.

## More to write about:

- LESS/CSS style guidelines, inspired by: https://medium.com/@fat/mediums-css-is-actually-pretty-fucking-good-b8e2a6c78b06
- Example View/Models
