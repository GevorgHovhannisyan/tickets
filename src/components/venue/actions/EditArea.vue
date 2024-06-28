<template>
  <ValidationObserver
    ref="edit_area_form"
    slim
    v-slot="{ handleSubmit, reset }"
    >
      <form
        class="edit_area_form"
        @submit.prevent="handleSubmit(updateArea)"
        @reset.prevent="reset"
        autocomplete="off"
      >
        <div class="form_fields">
          <div class="form_btns top_btns">
              <button type="button" class="secondary_btn" @click="cancelChanges">Cancel</button>
              <button aria-label="add section" class="primary_btn">Save</button>
          </div>
          <div class="field_block half_field">
             <ValidationProvider
                  name="text"
                  v-slot="{ errors }"
                  slim
                  rules="required"
                >

                <label :class="{ has_error: errors[0] }">
                  <span class="field_name">Name</span>
                  <input type="text" v-model="editData.name" @input="editAreaHelper(false)" />
                  <span class="error_message">{{
                        errors[0] ? "Required field" : ""
                    }}</span>
                </label>
              </ValidationProvider>
          </div>

          <div class="field_block half_field">
            <label>
              <span class="field_name">Tickets</span>
              <input type="number" min="1" v-model="editData.seats" @input="editAreaHelper(true)" />
            </label>
          </div>
          <div class="field_block">
            <div class="check_group">
              <label>
                <input
                  type="checkbox"
                  @change="displayTitle"
                  v-model="editData.hideTitle"
                />
                <span class="check_btn">Hide area name</span>
              </label>
            </div>
          </div>
          <span class="divider"></span>

          <div class="field_block">
            <span class="field_name">Rotation</span>
            <range-slider class="slider" min="-180" max="180" step="10" v-model="editData.rotation" @input="changeRotation">
            </range-slider>
          </div>

          <div class="field_block">
            <span class="field_name">Skew</span>
            <range-slider class="slider" min="-50" max="50" step="1" v-model="editData.skew" @input="modifyArea" @change="fixArea">
            </range-slider>
          </div>

          <div class="field_block">
            <span class="field_name">Curve</span>
            <range-slider class="slider" min="-13" max="13" step="1" v-model="editData.curveValue" @input="modifyArea" @change="fixArea">
            </range-slider>
          </div>

          <span class="divider"></span>
          <button class="primary_btn" type="button" @click="resetParams">Reset</button>
        </div>
      </form>
  </ValidationObserver>
</template>

<script>
import { mapGetters } from "vuex";
import RangeSlider from "vue-range-slider";
import _ from "lodash";
import "vue-range-slider/dist/vue-range-slider.css";
import {
  rotateTable,
  updateAreaStage,
  cancelAreaChanges,
  showHideTitle,
  modifyArea,
  fixArea
} from "@/helpers/area/generator";

import {
  deselectGroup
}  from "@/helpers/utils";

export default {
  props: {
    editArea: {
      type: Object,
      default: () => { },
    },
    popup: {
      type: Boolean,
      default: false,
    },
  },
  watch: {
    popup(opened) {
      if (!opened) {
        cancelAreaChanges(this.editArea);
      }
    },
  },
  data() {
    return {
      editData: {},
    };
  },
  created() {
    this.editData = _.cloneDeep(this.editArea);
  },
  methods: {
    editAreaHelper(ticket) {
      if (ticket) {
        let value = this.editData.seats.replace(/\D/g, "");
        this.editData.seats = value ? +value : 0;
      }
      const { layerId } = this.editArea;
      const payload = {
        tableData: this.editArea,
        newData: this.editData,
      };
      updateAreaStage(layerId, payload);
    },
    updateArea() {
      deselectGroup();
      this.$emit("closePopup");
    },
    changeRotation() {
      rotateTable(this.editData.rotation, this.editArea.layerId, this.editData);
    },
    modifyArea() {
      modifyArea(this.editData, this.editArea.layerId);
    },

    fixArea() {
      fixArea(this.editArea.layerId, this.editData);
    },
    cancelChanges() {
      cancelAreaChanges(this.editArea)
      this.$emit("closePopup", this.editArea);
    },
    resetParams() {
      this.editData.rotation = 0
      this.editData.skew = 0
      this.editData.curveValue = 0

      this.changeRotation();
      modifyArea(this.editData, this.editArea.layerId);
      fixArea(this.editArea.layerId, this.editData);

    },
    displayTitle(){
      const { hideTitle } = this.editData;
      const { layerId } = this.editArea;
      showHideTitle({ hideTitle, layerId });
    },
  },
  components: {
    RangeSlider,
  },
  computed: {
    ...mapGetters(["tableOptions"]),
  },
};
</script>

<style></style>
