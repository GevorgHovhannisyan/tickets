import axios from "axios";

export default {
  createVenue(payload) {
    return axios.post(`/createvenue`, payload);
  },
  getVenue(id) {
    return axios.get(`/getvenue/${id}`);
  },
  getVenues() {
    return axios.get(`/getvenueslist`);
  },
  updateVenue(payload) {
    return axios.post(`/updatevenue/${payload.id}`, payload);
  },
  deleteVenue(id) {
    return axios.delete(`/deletevenue/${id}`);
  },
};
