<template>
  <ValidationObserver
    ref="edit_section_form"
    slim
    v-slot="{ handleSubmit, reset }"
  >
    <form
      class="edit_section_form"
      @submit.prevent="handleSubmit(saveSectionChanges)"
      @reset.prevent="reset"
      autocomplete="off"
    >
      <div class="form_fields">
        <div class="form_btns top_btns">
          <a class="secondary_btn" @click="cancelSectionChanges">Cancel</a
          ><button aria-label="add section" class="primary_btn">Save</button>
        </div>

        <div class="field_block">
          <ValidationProvider
            name="name"
            v-slot="{ errors }"
            slim
            rules="required"
          >
            <label :class="{ has_error: errors[0] }">
              <span class="field_name">Section Name</span>
              <input
                type="text"
                name="name"
                @input="updateSectionName"
                v-model="editData.name"
              />
              <span class="error_message">{{
                errors[0] ? "Required field" : ""
              }}</span>
            </label>
          </ValidationProvider>
        </div>

        <div class="field_block">
          <div class="check_group">
            <label>
              <input
                type="checkbox"
                @change="displayTitle"
                v-model="editData.hideTitle"
              />
              <span class="check_btn">Hide section name</span>
            </label>
          </div>
        </div>

        <span class="divider"></span>

        <div class="field_block half_field">
          <ValidationProvider
            name="rows"
            v-slot="{ errors }"
            slim
            rules="required"
          >
            <label :class="{ has_error: errors[0] }">
              <span class="field_name">Rows</span>
              <input
                type="number"
                name="rows"
                min="1"
                @input="updateStage"
                v-model="editData.rows"
              />
              <span class="error_message">{{
                errors[0] ? "Required" : ""
              }}</span>
            </label>
          </ValidationProvider>
        </div>

        <div class="field_block half_field">
          <ValidationProvider
            name="seats"
            v-slot="{ errors }"
            slim
            rules="required"
          >
            <label>
              <span class="field_name">Seats</span>
              <input
                name="seats"
                type="number"
                @input="updateStage"
                v-model="editData.seats"
              />
              <span class="error_message">{{
                errors[0] ? "Required" : ""
              }}</span>
            </label>
          </ValidationProvider>
        </div>

        <span class="divider"></span>

        <div class="field_block one_third">
          <label>
            <span class="field_name">Row</span>
            <v-select
              v-model="editData.rowSortType"
              label="key"
              :reduce="(option) => option.key"
              :options="sortTypes"
              :searchable="false"
              :clearable="false"
              @input="updateStage"
            ></v-select>
          </label>
        </div>

        <div class="field_block one_third">
          <!-- v-slot="{ errors }" -->
          <ValidationProvider name="row_starts_with" slim rules="required">
            <label>
              <span class="field_name">Start with</span>
              <input
                type="text"
                name="row_starts_with"
                maxlength="2"
                @input="rowStartsWithFilter(editData.rowStartsWith)"
                v-model="editData.rowStartsWith"
              />
              <span class="error_message">{{ rowFieldError }}</span>
            </label>
          </ValidationProvider>
        </div>

        <div class="field_block one_third">
          <span class="field_name">Direction</span>
          <div class="radio_group">
            <label>
              <input
                type="radio"
                name="row_name_direction"
                value="19"
                @change="updateStage"
                v-model="editData.rowDirection"
              />
              <span class="radio_btn icon_a-z"></span>
            </label>
            <label>
              <input
                type="radio"
                name="row_name_direction"
                value="91"
                @change="updateStage"
                v-model="editData.rowDirection"
              />
              <span class="radio_btn icon_z-a"></span>
            </label>
          </div>
        </div>

        <div class="field_block">
          <span class="field_name">Label Display </span>
          <div class="check_group">
            <label>
              <input
                type="checkbox"
                @change="displayLabel"
                v-model="editData.label_left"
              />
              <span class="check_btn">Left</span>
            </label>
            <label>
              <input
                type="checkbox"
                @change="displayLabel"
                v-model="editData.label_right"
              />
              <span class="check_btn">Right</span>
            </label>
          </div>
        </div>

        <div class="field_block">
          <span class="field_name">Row spacing</span>
          <range-slider
            class="slider"
            min="0"
            max="30"
            step="1"
            v-model="editData.rowSpacing"
            @input="updateStage"
          >
          </range-slider>
        </div>

        <span class="divider"></span>

        <div class="field_block one_third">
          <label>
            <span class="field_name">Seat</span>
            <v-select
              v-model="editData.seatSortType"
              label="key"
              :reduce="(option) => option.key"
              :options="sortTypes"
              :searchable="false"
              :clearable="false"
              @input="updateStage"
            ></v-select>
          </label>
        </div>

        <div class="field_block one_third">
          <!-- v-slot="{ errors }" -->
          <ValidationProvider name="seat_starts_with" slim rules="required">
            <label>
              <span class="field_name">Start with</span>
              <input
                type="text"
                name="seat_starts_with"
                @input="seatStartsWithFilter(editData.seatStartsWith)"
                v-model="editData.seatStartsWith"
              />
              <span class="error_message">
                {{ seatFieldError }}
              </span>
            </label>
          </ValidationProvider>
        </div>

        <div class="field_block one_third">
          <span class="field_name">Direction</span>
          <div class="radio_group">
            <label>
              <input
                type="radio"
                name="seat_name_direction"
                value="19"
                @change="updateStage"
                v-model="editData.seatDirection"
              />
              <span class="radio_btn icon_19"></span>
            </label>
            <label>
              <input
                type="radio"
                name="seat_name_direction"
                value="91"
                @change="updateStage"
                v-model="editData.seatDirection"
              />
              <span class="radio_btn icon_91"></span>
            </label>
          </div>
        </div>

        <!-- <div class="field_block">
          <label>
            <input
              type="checkbox"
              @change="updateStage"
              v-model="editData.numbers_order"
            />
            <span class="check_btn">Numbers one by one</span>
          </label>
        </div> -->
  
        <span class="divider"></span>

        <div class="field_block half_field">
          <label>
            <input
              type="checkbox"
              @change="updateStage"
              v-model="editData.dont_show_I"
            />
            <span class="check_btn">Dont show "I"</span>
          </label>
        </div>

        <div class="field_block half_field">
          <label>
            <input
              type="checkbox"
              @change="updateStage"
              v-model="editData.dont_show_O"
            />
            <span class="check_btn">Dont show "O"</span>
          </label>
        </div>

        <span class="divider"></span>

        <div class="field_block ">
          <span class="field_name">Alignment</span>
          <div class="radio_group">
            <label>
              <input
                type="radio"
                name="seatAlign"
                value="left"
                @change="updateStage('alignment')"
                v-model="editData.alignment"
              />
              <span class="radio_btn icon_justify"></span>
            </label>
            <label>
              <input
                type="radio"
                name="seatAlign"
                value="center"
                @change="updateStage('alignment')"
                v-model="editData.alignment"
              />
              <span class="radio_btn icon_center"></span>
            </label>
          </div>
        </div>



        <div class="field_block">
          <span class="field_name"> Seat spacing</span>
          <range-slider
            class="slider"
            min="0"
            max="30"
            step="1"
            v-model="editData.seatSpacing"
            @input="updateStage"
          >
          </range-slider>
        </div>

        <span class="divider"></span>

        <div class="field_block">
          <span class="field_name">Curve</span>
          <range-slider
            class="slider"
            min="-8"
            max="8"
            step="0.5"
            v-model="editData.curveValue"
            @input="changeCurve"
          >
          </range-slider>
        </div>

        <div class="field_block">
          <span class="field_name">Skew</span>
          <range-slider
            class="slider"
            min="-5"
            max="5"
            step="0.5"
            v-model="editData.skewValue"
            @input="changeSkew"
          >
          </range-slider>
        </div>

        <div class="field_block">
          <span class="field_name">Rotation</span>
          <range-slider
            class="slider"
            min="-180"
            max="180"
            step="10"
            v-model="editData.rotation"
            @input="changeRotation"
          >
          </range-slider>
        </div>

        <span class="divider"></span>
        <button class="primary_btn" type="button" @click="resetParams">Reset</button>
        <!-- <div class="form_btns">
          <a class="secondary_btn" @click="cancelSectionChanges">Cancel</a
          ><button aria-label="add section" class="primary_btn">Save</button>
        </div> -->
      </div>
    </form>
  </ValidationObserver>
</template>

<script>
import RangeSlider from "vue-range-slider";
import _ from "lodash";
import "vue-range-slider/dist/vue-range-slider.css";
import {
  skewSection,
  rotateSection,
  updateSection,
  curveSection,
  saveChanges,
  cancelChanges,
  showHideLabels,
  showHideTitle
} from "@/helpers/section/_generator";

import { deselectGroup } from "@/helpers/utils";

import { bindSectionConfigs } from "../utils";
import { deselectGroupSeats } from "@/helpers/seatUtils";
import { changeSectionName } from "@/helpers/section/_utils";

export default {
  props: {
    editItem: {
      type: Object,
      default: () => {},
    },
    popup: {
      type: Boolean,
      default: false,
    },
  },

  methods: {
    updateSectionName() {
      const { layerId } = this.editItem;
      const configs = bindSectionConfigs(this.editData);
      this.editData = configs;
      changeSectionName(layerId, configs);
    },
    changeSkew() {
      skewSection(
        this.editData.skewValue,
        this.editItem.layerId,
        this.editData
      );
    },
    changeRotation() {
      rotateSection(
        this.editData.rotation,
        this.editItem.layerId,
        this.editData
      );
    },
    changeCurve() {
      curveSection(
        this.editData.curveValue,
        this.editItem.layerId,
        this.editData
      );
    },
    resetParams() {
      this.editData.rotation = 0
      this.editData.skewValue = 0
      this.editData.curveValue = 0

      this.changeRotation();
      this.changeSkew();
      this.changeCurve();
    },
    updateStage(field) {
      const { layerId } = this.editItem;
      const configs = bindSectionConfigs(this.editData);
      this.editData = configs;
      let alignmentChange = field === 'alignment';
      updateSection(layerId, configs, alignmentChange);
    },

    cancelSectionChanges() {
      cancelChanges(this.editItem);
      this.$emit("closePopup");
    },
    saveSectionChanges() {
      const { layerId } = this.editItem;
      deselectGroup();
      deselectGroupSeats(layerId);
      
      this.$emit("closePopup");
    },
    displayLabel() {
      const { label_left, label_right } = this.editData;
      const { layerId } = this.editItem;
      showHideLabels({ label_left, label_right, layerId }, this.editData);
    },
    displayTitle(){
      const { hideTitle } = this.editData;
      const { layerId } = this.editItem;
      showHideTitle({ hideTitle, layerId });
    },
    rowStartsWithFilter(value) {
      if (this.editData.rowSortType === "ABC") {
        let inputValue = value;

        // Remove any whitespace from the input value
        inputValue = inputValue.trim();

        // Ensure only one character is entered
        if (inputValue.length > 2) {
          inputValue = inputValue.slice(0, 2);
        }

        // Convert the character to uppercase
        inputValue = inputValue.toUpperCase();
        this.editData.rowStartsWith = inputValue;
      }
      this.updateStage();
      this.startsWithError();
    },
    seatStartsWithFilter(value) {
      if (this.editData.seatSortType === "ABC") {
        let inputValue = value;

        // Remove any whitespace from the input value
        inputValue = inputValue.trim();

        // Ensure only one character is entered
        if (inputValue.length > 2) {
          inputValue = inputValue.slice(0, 2);
        }

        // Convert the character to uppercase
        inputValue = inputValue.toUpperCase();
        this.editData.seatStartsWith = inputValue;
      }

      this.updateStage();
      this.startsWithErrorSeat();
    },
    startsWithErrorSeat() {
      let text = "";

      // Rule 3: After "Z", only repeated characters like "AA", "BB", etc.
      if (this.editData.seatStartsWith.length > 1) {
        const firstChar = this.editData.seatStartsWith.charAt(0);
        const restChars = this.editData.seatStartsWith.substring(1);

        if (restChars !== firstChar.repeat(restChars.length)) {
          text = "Format 'A', 'ZZ'";

          this.$refs.edit_section_form.setErrors({
            seat_starts_with: [text],
          });
          return text;
        }
      }

      if (!this.editData.seatStartsWith) {
        text = "Required";
        this.$refs.edit_section_form.setErrors({
          seat_starts_with: [text],
        });
        return text;
      }

      // All rules passed, input is valid
      return "";
    },
    startsWithError() {
      let text = "";
      // Rule 3: After "Z", only repeated characters like "AA", "BB", etc.
      if (this.editData.rowStartsWith.length > 1) {
        const firstChar = this.editData.rowStartsWith.charAt(0);
        const restChars = this.editData.rowStartsWith.substring(1);

        if (restChars !== firstChar.repeat(restChars.length)) {
          text = "Format 'A', 'ZZ'";
          this.$refs.edit_section_form.setErrors({
            row_starts_with: [text],
          });
          return text;
        }
      }
      return "";
    },
  },
  data() {
    return {
      editData: {},
      sortTypes: [
        { key: "ABC" },
        { key: "123" },
        { key: "135" },
        { key: "246" },
      ],
      curveValue: 0,
    };
  },
  watch: {
    popup(opened) {
      if (!opened) {
        cancelChanges(this.editItem);
      }
    },
  },
  created() {
    this.editData = _.cloneDeep(this.editItem);
  },
  computed: {
    rowFieldError() {
      let text = "";
      // Rule 3: After "Z", only repeated characters like "AA", "BB", etc.

      if (
        this.editData.rowStartsWith.length > 1 &&
        this.editData.rowSortType === "ABC"
      ) {
        const firstChar = this.editData.rowStartsWith.charAt(0);
        const restChars = this.editData.rowStartsWith.substring(1);

        if (restChars !== firstChar.repeat(restChars.length)) {
          text = "Format 'A', 'ZZ'";
          this.$refs.edit_section_form.setErrors({
            row_starts_with: [text],
          });
          return text;
        }
      }
      return "";
    },
    seatFieldError() {
      let text = "";

      // Rule 3: After "Z", only repeated characters like "AA", "BB", etc.
      if (
        this.editData.seatStartsWith.length > 1 &&
        this.editData.seatSortType === "ABC"
      ) {
        const firstChar = this.editData.seatStartsWith.charAt(0);
        const restChars = this.editData.seatStartsWith.substring(1);

        if (restChars !== firstChar.repeat(restChars.length)) {
          text = "Format 'A', 'ZZ'";

          this.$refs.edit_section_form.setErrors({
            seat_starts_with: [text],
          });
          return text;
        }
      }

      if (!this.editData.seatStartsWith) {
        text = "Required";
        this.$refs.edit_section_form.setErrors({
          seat_starts_with: [text],
        });
        return text;
      }

      // All rules passed, input is valid
      return "";
    },
  },
  components: {
    RangeSlider,
  },
};
</script>

<style></style>
