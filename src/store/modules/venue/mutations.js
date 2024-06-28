import * as types from "@/store/mutation-types";

export default {
  [types.SET_VENUE](state, data) {
    state.venue = data;
  },
  [types.SET_VENUE_LIST](state, data) {
    state.venues = data;
 
  },
  [types.SET_VENUE_TO_LIST](state, data) {
    state.venues.push({...data})

    state.venues.sort((a, b) => {
      // Convert names to lowercase for case-insensitive comparison
      let nameA = a.name.toLowerCase();
      let nameB = b.name.toLowerCase();

      // Check if both names are numeric strings
      if (!isNaN(nameA) && !isNaN(nameB)) {
          // If both names are numeric, convert them to numbers and compare
          return parseFloat(nameA) - parseFloat(nameB);
      } else {
          // If one or both names are non-numeric strings, do a standard string comparison
          return nameA.localeCompare(nameB);
      }
  });

  },
  [types.SET_MAIN_GROUP](state, layer) {
    state.layers.push(layer);
  },
  [types.DELETE_LAYER](state, id) {
    const filterLayers = state.layers.filter(
      (elem) => elem.layer.attrs.id !== id
    );
    state.layers = filterLayers;
  },
  [types.SET_BUILDER_CONFIGS](state, configs) {
    state.venue_configs = configs;
  },
  [types.SET_EDIT_CONFIGS](state, configs) {
    state.new_config_venue = configs;
  },
  [types.SET_EDIT_BUILDER_CONFIGS](state, configs) {
    state.edit_venue_configs = configs;
  },
  [types.SET_INVALID_IMAGE](state, invalid_image) {
    state.invalid_image = invalid_image;
  },
  [types.DELETE_VENUE](state, id) {
    const index = state.venues.findIndex((c) => c.id === id);
    state.venues.splice(index, 1);
  },
  [types.RESET_STAGE](state, id) {
    state.new_config_venue = null;
  },
};
