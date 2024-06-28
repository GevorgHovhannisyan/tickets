/* eslint-disable */
import * as types from "@/store/mutation-types";
import router from "@/router";
import api from "@/service/api/auth";

export default {
  login({ commit }, payload) {
    return new Promise((resolve, reject) => {
      commit(types.SHOW_LOADING, true);
      api
        .adminLogin(payload)
        .then((response) => {
          if (response.status === 200) {
            window.localStorage.setItem(
              "admin",
              JSON.stringify(response.data.user)
            );

            window.localStorage.setItem("token", response.data.token);

            commit(types.SET_ADMIN, response.data);

            router.push("/venue").then(() => {
              setTimeout(() => {
                commit(types.SHOW_LOADING, false);
              }, 500);
            });
          }
          resolve(response);
        })
        .catch((error) => {
          commit(types.SHOW_LOADING, false);
          reject(error);
        });
    });
  },
  adminGet({ commit }, id) {
    return new Promise((resolve, reject) => {
      // commit("SHOW_LOADING", true)
      api
        .adminGet(id)
        .then((response) => {
          commit(types.SAVE_USER, { admin: response.data });
          resolve(response);

          // setTimeout(() => {
          //   commit("SHOW_LOADING", false)
          // }, 300)
        })
        .catch((error) => {
          commit(types.SHOW_LOADING, false);

          if (error && error.response && error.response.status === 401) {
            router.push("/login");
          }

          reject(error);
        });
    });
  },

  userLogout({ commit }) {
    window.localStorage.removeItem("token");
    window.localStorage.removeItem("admin");
    commit(types.LOGOUT);

    router.push({
      name: "login",
    });
  },
};
