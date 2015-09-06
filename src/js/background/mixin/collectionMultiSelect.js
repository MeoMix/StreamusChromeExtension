export default {
  initialize: function() {
    this.on('change:selected', this._onChangeSelected);
    this.on('change:firstSelected', this._onChangeFirstSelected);

    this.listenTo(StreamusBG.channels.foreground.vent, 'endUnload', this._onForegroundEndUnload.bind(this));
  },

  deselectAll: function() {
    this.invoke('set', 'selected', false);
  },

  // Return a list of selected models.
  getSelectedModels: function() {
    var selectedModels = this.where({
      selected: true
    });

    return selectedModels;
  },

  // Returns the model which was first selected (or selected last if ctrl was pressed)
  getFirstSelectedModel: function() {
    var firstSelectedModel = this.findWhere({
      firstSelected: true
    });

    return firstSelectedModel;
  },

  // Returns an array of Video models underlying the selected models in the collection.
  getSelectedVideos: function() {
    var selectedModels = this.getSelectedModels();
    var selectedVideos = _.invoke(selectedModels, 'get', 'video');

    return selectedVideos;
  },

  _onChangeSelected: function(model, selected) {
    // Whenever only one model is selected -- it becomes the first one to be selected.
    var selectedModels = this.getSelectedModels();

    if (selectedModels.length === 1) {
      selectedModels[0].set('firstSelected', true);
    }

    // A model which is no longer selected can't be the first selected model.
    if (!selected) {
      model.set('firstSelected', false);
    }
  },

  // Ensure that only 1 item is ever first selected.
  _onChangeFirstSelected: function(changedModel, firstSelected) {
    if (firstSelected) {
      this.each(function(model) {
        if (model !== changedModel && model.get('firstSelected')) {
          model.set('firstSelected', false);
        }
      });
    }
  },

  _onForegroundEndUnload: function() {
    this.deselectAll();
  }
};