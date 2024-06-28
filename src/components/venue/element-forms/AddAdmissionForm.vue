<template>
  <div class="addmission_area">
    <div class="modal_title">New General Admission Section</div>
    <div class="modal_description">
      Configure your new section. You can change this any time
    </div>
    <ValidationObserver ref="create_area" slim v-slot="{ handleSubmit, reset }">
      <form
        class="create_area"
        @submit.prevent="handleSubmit(submitArea)"
        @reset.prevent="reset"
        autocomplete="off"
      >
      <div class="form_fields">
        <div class="field_block">
          <ValidationProvider
            name="name"
            v-slot="{ errors }"
            slim
            rules="required"
          >
            <label :class="{ has_error: errors[0] }">
              <span class="field_name">Admission Section Name</span>
              <input type="text" name="name" v-model="area.name" />
              <span class="error_message">{{ errors[0] ? "Required field" : "" }}</span>

            </label>
          </ValidationProvider>
        </div>

        <div class="field_block">
          <ValidationProvider
            name="seats"
            v-slot="{ errors }"
            slim
            rules="required"
          >
            <label :class="{ has_error: errors[0] }">
              <span class="field_name">Section Tickets</span>
              <input
                type="text"
                oninput="this.value=this.value.replace(/[^0-9]/g,'');"
                name="seats"
                maxlength="5"
                v-model="area.seats"
              />
              <span class="error_message">{{ errors[0] }}</span>

            </label>
          </ValidationProvider>
        </div>
        <span class="divider"></span>

        <div class="form_btns">
          <div
            @click="$emit('cancel')"
            class="secondary_btn"
            aria-label="cancel"
          >
            Cancel
          </div>
          <button class="primary_btn" aria-label="add area">Add Area</button>
        </div>
      </div>
      </form>
    </ValidationObserver>
  </div>
</template>

<script>
export default {
  data() {
    return {
      area: {
        name: null,
        seats: 100,
        // hideTitle: false,
        rectH: 400,
        rectW: 400,
      },
    };
  },
  methods: {
    submitArea() {
      this.$emit("submitArea", { 
        type: "area",
        data: { ...this.area },
      });
    },
  },
};
</script>

<style></style>
