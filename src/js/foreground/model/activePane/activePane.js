'use strict';
import {Model} from 'backbone';
import ActivePaneType from 'foreground/enum/activePaneType';

var ActivePane = Model.extend({
  defaults: {
    type: ActivePaneType.None,
    relatedModel: null
  }
});

export default ActivePane;