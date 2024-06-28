<template>
  <div class="section_form">
    <div class="modal_title">New Seating Section</div>
    <div class="modal_description">
      Configure your new section. You can change this any time
    </div>
    <ValidationObserver
      ref="create_section"
      slim
      v-slot="{ handleSubmit, reset }"
    >
      <form
        class="create_section"
        @submit.prevent="handleSubmit(submitSection)"
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
                <span class="field_name">Section Name</span>
                <input type="text" name="name" v-model="section.name" />
                <span class="error_message">{{ errors[0]? "Required field" : "" }}</span>
              </label>
            </ValidationProvider>
          </div>
          <div class="field_block two_third">
            <ValidationProvider
              name="rows"
              v-slot="{ errors }"
              slim
              rules="required"
            >
              <label :class="{ has_error: errors[0] }">
                <span class="field_name">Rows</span>
                <input type="text" name="rows" v-model="section.rows" />
                <span class="error_message">{{ errors[0] }}</span>
              </label>
            </ValidationProvider>
          </div>
          <div class="field_block one_third">
            <label>
              <span class="field_name">Rows Numbering</span>
              <v-select
                v-model="section.rowSortType"
                label="key"
                :reduce="(option) => option.key"
                :options="sortTypes"
                :searchable="false"
                :clearable="false"
              ></v-select>
            </label>
          </div>
          <div class="field_block two_third">
            <ValidationProvider
              name="seats"
              v-slot="{ errors }"
              slim
              rules="required"
            >
              <label :class="{ has_error: errors[0] }">
                <span class="field_name">Seats</span>
                <input type="text" name="seats" v-model="section.seats" />
                <span class="error_message">{{ errors[0] }}</span>
              </label>
            </ValidationProvider>
          </div>
          <div class="field_block one_third">
            <label>
              <span class="field_name">Seats Numbering</span>
              <v-select
                v-model="section.seatSortType"
                label="key"
                :reduce="(option) => option.key"
                :options="sortTypes"
                :searchable="false"
                :clearable="false"
              ></v-select>
            </label>
          </div>
        </div>
        <span class="divider"></span>

    <div class="form_btns">
          <a class="secondary_btn" @click="$emit('closePopup')">Cancel</a>
          <button class="primary_btn" aria-label="add section">
            Add Section
          </button>
        </div>
      </form>
    </ValidationObserver>
  </div>
</template>

<script>
import { bindSectionConfigs } from "../utils";
export default {
  methods: {
    submitSection() {
      const sectionConf = bindSectionConfigs(this.section);
      this.$emit("submitSection", {
        type: "section",
        data: { ...sectionConf },
      });
    },
  },
  data() {
    return {
      section: {
        name: null,
        rows: 5,
        rowSortType: "ABC",
        rowStartsWith: "A",
        seats: 10,
        seatSortType: "123",
        seatStartsWith: "1",
        seatSpacing: 0,
        rowSpacing: 0,
        dont_show_I: false,
        dont_show_O: false,
        label_left: true,
        label_right: true,
        seatDirection: "19",
        rowDirection: "91",
        curveValue: null,
        skewValue: 0,
        rotation: 0,
        alignment: 'left',
        hideTitle: false,
        numbers_order: false
      },

      sortTypes: [
        { key: "ABC" },
        { key: "123" },
        { key: "135" },
        { key: "246" },
      ],
    };
  },
};
</script>

<style></style>
