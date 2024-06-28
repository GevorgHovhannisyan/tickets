<template>
 
      <ElementList @closePopup="$emit('closePopup')" @submitElement="submitElement" />
 
</template>

<script>
import ElementList from "./ElementList.vue";
export default {
  data() {
    return {
      element: {
        type: null,
      },
    };
  },
  methods: {
    submitElement(data) {
      this.$emit("appendElementToBuilder", data);
    },
  },
  components: {
    ElementList,
  },
};
</script>

<style lang="scss">
.elemets {
  display: flex;
  > div {
    border: 1px solid black;
  }
}
</style>
