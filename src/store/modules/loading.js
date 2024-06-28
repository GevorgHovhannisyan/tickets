import * as types from "@/store/mutation-types"

const getters = {
  loading: (state) => state.loading
}

const mutations = {
  [types.SHOW_LOADING](state, value) {
    state.loading = value
  }
}

const state = {
  loading: false
}

export default {
  state,
  getters,
  mutations
}
