import Vue from "vue"
import axios from "axios"
import router from "@/router"
// import moment from "moment"
// let delayTimer = null

axios.defaults.baseURL = process.env.VUE_APP_API_URL || ""
// Add a response interceptor
axios.interceptors.response.use(
  (response) => {
    return response
  },
  (error) => {
    if (error && error.response && error.response.status === 401) {
      localStorage.removeItem("admin")
      localStorage.removeItem("token")
    }

    // Do something with response error
    return Promise.reject(error)
  }
)

axios.interceptors.request.use(
  (config) => {
    const whiteList = ["/login"]

    if (whiteList.indexOf(config.url) === -1 && localStorage.getItem("token")) {
      config.headers.Authorization = `Bearer ${localStorage.getItem("token")}`
    }

    return config
  },
  (error) => {
    return Promise.reject(error)

    // Do something with response error
  }
)

// eslint-disable-next-line no-shadow
Plugin.install = (Vue) => {
  Vue.axios = axios
  window.axios = axios
  Object.defineProperties(Vue.prototype, {
    axios: {
      get() {
        return axios
      }
    },
    $axios: {
      get() {
        return axios
      }
    }
  })
}

Vue.use(Plugin)

export default Plugin
