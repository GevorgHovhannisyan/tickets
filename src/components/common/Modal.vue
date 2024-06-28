<template>
    <div v-if="showModal" class="modal_block">
      <div class="modal_inner">
        <div class="modal_content">
          <span v-if="showClose" class="modal_close icon_close" @click="closePopup"></span>
          <slot> </slot>
        </div>
      </div>
    </div>
</template>

<script>
export default {
  props: {
    openPopup: {
      type: Boolean,
    },
    showClose: {
      type: Boolean,
      default: false
    }, 
  },
  watch: {
    openPopup(val) {
      this.showModal = val;
    },
  },
  data() {
    return {
      showModal: false,
    };
  },
  created() {
    this.showModal = this.openPopup;
  },
  methods: {
    closePopup() {
      this.showModal = false;
      this.$emit("closePopup");
    },
  },
};
</script>

<style>
/* Modal styles */

