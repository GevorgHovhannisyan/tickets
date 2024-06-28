/* eslint-disable */
import * as types from "@/store/mutation-types";
import api from "@/service/api/venue";
import router from "@/router";

export default {
  createVenue({ commit }, payload) {
    const payloadFilter = JSON.parse(JSON.stringify(payload));
    if(payloadFilter.id) delete  payloadFilter.id
    commit("SHOW_LOADING", true);
    return new Promise((resolve, reject) => {
      api
        .createVenue(payloadFilter)
        .then((response) => {
          // commit(types.SAVE_USER, { admin: response.data });
          if(response.data && response.data.venue.datajson) delete response.data.venue.datajson
          commit(types.SET_VENUE_TO_LIST, response.data.venue);
          resolve(response);

          setTimeout(() => {
            commit("SHOW_LOADING", false);
          }, 300);
        })
        .catch((error) => {
          if (error && error.response && error.response.status === 401) {
            router.push("/login");
          }

          reject(error);

          setTimeout(() => {
            commit("SHOW_LOADING", false);
          }, 300);
        });
    });
  },
  getVenues({ commit }, payload) {
    commit("SHOW_LOADING", true);

    return new Promise((resolve, reject) => {
      api
        .getVenues(payload)
        .then((response) => {
          commit(types.SET_VENUE_LIST, response.data);
          resolve(response);

          setTimeout(() => {
            commit("SHOW_LOADING", false);
          }, 300);
        })
        .catch((error) => {
          if (error && error.response && error.response.status === 401) {
            router.push("/login");
          }

          setTimeout(() => {
            commit("SHOW_LOADING", false);
          }, 300);
          reject(error);
        });
    });
  },
  getVenue({ commit }, id) {
    commit("SHOW_LOADING", true);
    return new Promise((resolve, reject) => {
      api
        .getVenue(id)
        .then((response) => {
          commit(types.SET_EDIT_BUILDER_CONFIGS, response.data.venue);
          resolve(response);

          setTimeout(() => {
            commit("SHOW_LOADING", false);
          }, 300);
        })
        .catch((error) => {
          if (error && error.response && error.response.status === 401) {
            router.push("/login");
          }

          setTimeout(() => {
            commit("SHOW_LOADING", false);
          }, 300);
          reject(error);
        });
    });
  },
  updateVenue({ commit }, payload) {
    commit("SHOW_LOADING", true);
    return new Promise((resolve, reject) => {
      api
        .updateVenue(payload)
        .then((response) => {
          // commit(types.SET_EDIT_BUILDER_CONFIGS, response.data.venue);
          resolve(response);

          setTimeout(() => {
            commit("SHOW_LOADING", false);
          }, 300);
        })
        .catch((error) => {
          if (error && error.response && error.response.status === 401) {
            router.push("/login");
          }

          setTimeout(() => {
            commit("SHOW_LOADING", false);
          }, 300);
          reject(error);
        });
    });
  },

  deleteVenue({ commit }, id) {
    commit("SHOW_LOADING", true);
    return new Promise((resolve, reject) => {
      api
        .deleteVenue(id)
        .then((response) => {
          commit(types.DELETE_VENUE, id);
          resolve(response);

          setTimeout(() => {
            commit("SHOW_LOADING", false);
          }, 300);
        })
        .catch((error) => {
          if (error && error.response && error.response.status === 401) {
            router.push("/login");
          }

          reject(error);

          setTimeout(() => {
            commit("SHOW_LOADING", false);
          }, 300);
        });
    });
  },
  saveVenueConfigs({ commit }, payload) {
    return new Promise((resolve, reject) => {
      commit(types.SET_VENUE, payload);
      resolve(payload);
    });
  },


  resetStoreStage({ commit }) {
    commit(types.RESET_STAGE)
  },
};
