<template>
  <div id="app">
    <Loader v-if="loading" />

    <router-view />
  </div>
</template>

<script>
import { mapGetters, mapActions } from "vuex";
export default {
  async created() {
    if (this.admin) {
      await this.adminGet(this.admin.id).catch((error) => {
        if (error && error.response && error.response.status === 401) {
      localStorage.removeItem("admin");
          localStorage.removeItem("token");
          this.$store.commit("LOGOUT");
        }
      });
    }
  },
  computed: {
    ...mapGetters(["admin"]),
    loading() {
      return this.$store.getters.loading;
    },
  },
  methods: {
    ...mapActions(["adminGet"]),
  },
  watch: {
    loading(loading) {
      if (loading) {
        document.body.classList.add("loading");
      } else {
        document.body.classList.remove("loading");
      }
    },
  },
};
</script>
