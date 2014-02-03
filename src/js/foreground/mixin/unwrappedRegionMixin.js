//  http://stackoverflow.com/questions/11195242/extra-wrappers-in-backbone-and-marionette/15079356#15079356
//  Useful when I don't want to generate an extra wrapper when creating a Region.
define({
    open: function(viewInstance) {
        viewInstance.$el.children().clone(true).appendTo(this.$el);
    }
});