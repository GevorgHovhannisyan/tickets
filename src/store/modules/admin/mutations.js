import * as types from "@/store/mutation-types"

export default {
  [types.SET_ADMIN](state, admin) {
    state.admin = admin;
  },
  [types.LOGOUT](state) {
    state.admin = null
  },
};
