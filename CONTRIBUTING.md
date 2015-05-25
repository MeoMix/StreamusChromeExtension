# JavaScript Coding Conventions Guide

This is not intended to be a comprehensive list. If a situation is not described in this guide, use common best practices such as the [Google JavaScript Style Guide](https://google-styleguide.googlecode.com/svn/trunk/javascriptguide.xml). 

## Code Comments

- Comments should explain "why" not "what".
- Less can be more with comments. Encourage yourself to re-read comments after writing them and see if you can convey the same thought more succinctly.
- Custom methods (private or public) should each have a summary unless their function is blindingly obvious.
- Backbone/Marionette method overrides should not have summary comments. For instance, `onRender` does not need a comment explaining that it is called when the view is rendered.
- Hacks, workarounds, uncommon patterns, etc. should have an explanation of why they are necessary. Provide links for copy/pasted code source(s).
- Use proper sentences.
- Marionette and Backbone modules should be organized into the following sections, denoted by comments:
    - Marionette/Backbone Properties/Methods
    - Public Properties/Methods
    - Mixin Properties/Methods
    - Private Properties/Methods

## Variable Names

### General Variable Names

- Variable names must not be [reserved words or identifiers](http://www.javascripter.net/faq/reserved.htm).
- Method names must not be reserved Backbone/Marionette names, unless the intent is to override the method. Examples: `_onCollectionAdd`, `_onCollectionRemove`, and `_ensureElement`.
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
- Use Underscore/Lo-Dash functions instead of custom loops.  
- Do not leave commented-out code.

### Backbone/Marionette Code Organization

- Backbone/Marionette modules should be organized in the following order:
    1. Backbone/Marionette properties.
    2. Backbone/Marionette methods, in the order in which they are called.
    3. Public properties.
    4. Public methods, in the order in which they are called.
    5. Mixin properties.
    6. Mixin methods.
    7. Private properties.
    8. Private methods, in the order in which they are called.
- Event handlers named according to their event/object should not contain functional code. They should call methods named according to their function.
    - Example: `onDrinkCoffee` should call `typeMuchCode` and then `crash`, rather than having the contents of those methods within `onDrinkCoffee` itself.
- Custom instance-scope variables should be initialized in `initialize()` (or a custom method called from `initialize`).
- Backbone model attributes should be defined in `defaults`. Use a function instead of object for `defaults` if the properties are non-primitive types.
- Use Marionette Behaviors instead of mixins/inheritance for Marionette views.
- Keep Marionette templates as simple as possible.  

## Event Handling

- UI events should not directly affect view state. Instead, they should affect Backbone model state, which triggers changes to the view state.
- Use Marionette's `events`, `modelEvents`, and `collectionEvents`.
- Always use Backbone `listenTo()` instead of `on()` except in the case of a model listening to itself.
- Listeners should be defined in `initialize`.
- `$.on()` should have an associated `$.off()` in a destructor.
- Custom events and triggers should be avoided if possible. There is probably a Backbone/Marionette event that suits your needs.

## Tests

- Write tests for:
    - Common modules (anything used by more than one module).
    - Public methods, but not for private methods.
    - All expected custom functionality.
- Don't write tests for:
    - Marionette Views. Views change too often to write tests for, and non-view-specific logic should be in a Backbone model.
    - Functionality that you didn't implement (such as library functionality).
- Write both positive and negative tests (i.e. ensure a method works as expected and does not work when it shouldn't).
- Tests should not contain unnecessary abstractions-- it is okay to be repetitive.  
- Use [Chai's Behavioral Driven Development style assertions](http://chaijs.com/api/bdd/).
- Separate tests using `describe` blocks.
- Write `// act` above the line that is executing the code which is under test (to differentiate it from code that arranges the test).
- Write one assertion per test.

## Random Things

- Don't leave a trailing comma. Example: `{ a, }` should be: `{ a }`.
- Don't use `parseInt` without radix. Example: `parseInt(x)` should be `parseInt(x, 10)` or `_.parseInt(x)`.
- Throw errors if required arguments are not defined or set to an acceptable value.
- Do use `_.isUndefined` and/or `_.isNull` (and understand the difference).
- Use objects as enumerations to define constants.
- Avoid magic values, use named constants instead.
- Do not rely on DOM state-- use Backbone models for state instead.
- `setter` methods should not return a value.
- `getter` methods should not change any state.

## Working on Existing Code

- Turn off auto-formatting on-save in your editor.
- Use the same tabs/space format as the existing file.
- Don't change existing code unless it is necessary or it can be considered within the scope of your current issue.
- Leave whitespace untouched.
- Don't add unrelated code to an existing method. Make a new method and call it from the appropriate event handler.