import axios from "axios";

export default {
  adminGet(id) {
    return axios.get(`/user/${id}`);
  },
  adminLogin(payload) {
    return axios.post("/auth/login", payload);
  },

};
