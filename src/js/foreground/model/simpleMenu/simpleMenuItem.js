import _ from 'common/shim/lodash.reference.shim';
import {Model} from 'backbone';
import FixedPosition from 'foreground/enum/fixedPosition';

var SimpleMenuItem = Model.extend({
  defaults: {
    text: '',
    value: null,
    active: false,
    disabled: false,
    fixedPosition: FixedPosition.None,
    onClick: _.noop
  }
});

export default SimpleMenuItem;