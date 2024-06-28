<template>
<ValidationObserver
  ref="edit_table_form"
  slim
  v-slot="{ handleSubmit, reset }"
  >
    <form
      class="edit_table_form"
      @submit.prevent="handleSubmit(updateTable)"
      @reset.prevent="reset"
      autocomplete="off"
    >
      <div class="form_fields">
        <div class="form_btns top_btns">
            <button type="button" class="secondary_btn" @click="cancelChanges">Cancel</button>
            <button aria-label="add section" class="primary_btn">Save</button>
        </div>

        <div class="field_block">
          <ValidationProvider
              name="seats"
              v-slot="{ errors }"
              slim
              rules="required"
            >

            <label :class="{ has_error: errors[0] }">
              <span class="field_name">Seats</span>
              <v-select
                v-if="editTable.type === 'rectangle' || editTable.type === 'square'"
                v-model="editData.seats"
                :options="tableOptions[editTable.type]"
                :reduce="(seats) => seats"
                @input="editTableHelper"
                :searchable="false"
                :clearable="false"
              ></v-select>

              <input
                v-else
                name="seats"
                type="text"
                oninput="this.value=this.value.replace(/[^0-9]/g,'');"
                @input="editTableHelper"
                v-model="editData.seats"
              />
              <span class="error_message">{{
                    errors[0] ? "Required field" : ""
                }}</span>
            </label>
          </ValidationProvider>
        </div>

        <span class="divider"></span>

        <div class="field_block">
          <ValidationProvider
              name="name"
              v-slot="{ errors }"
              slim
              rules="required"
          >
            <label :class="{ has_error: errors[0] }">
              <span class="field_name">Name</span>
              <textarea name="name" rows="2" maxlength="20" v-model="editData.name" @input="editTableHelper"></textarea>
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
                <span class="check_btn">Hide table name</span>
              </label>
            </div>
          </div>

        <div class="field_block">
                    <span class="field_name">Font Size</span>
                    <range-slider class="slider" min="14" max="40" step="1" v-model="editData.fontSize" @input="editTableHelper">
                    </range-slider>
                </div>
                <div class="field_block">
                    <span class="field_name">Line Height</span>
                    <range-slider class="slider" min="1" max="2" step="0.1" v-model="editData.lineHeight" @input="editTableHelper">
                    </range-slider>
                </div>
                <div class="field_block">
                    <span class="field_name">Letter Spacing</span>
                    <range-slider class="slider" min="-1" max="5" step="0.5" v-model="editData.spacing" @input="editTableHelper">
                    </range-slider>
                </div>

                <span class="divider"></span>
                <div class="field_block half_field">
                    <div class="check_group">
                        <label>
                            <input
                                type="checkbox"
                                @change="editTableHelper"
                                v-model="editData.upperCase"
                            />
                            <span class="check_btn">Uppercase</span>
                        </label>
                    </div>
                </div>
                <div class="field_block half_field">
                    <div class="check_group">
                        <label>
                            <input
                                type="checkbox"
                                @change="editTableHelper"
                                v-model="editData.bold"
                            />
                            <span class="check_btn">Bold</span>
                        </label>
                    </div>
                </div>
                <span class="divider"></span>


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

        <!-- <div class="form_btns">
          <button class="secondary_btn" @click="cancelChanges">Cancel</button>
          <button class="primary_btn" @click="updateTable">Submit</button>
        </div> -->
      </div>
    </form>
  </ValidationObserver>
</template>

<script>
import { mapGetters } from "vuex";
import RangeSlider from "vue-range-slider";
import {
  updateTableStage,
  rotateTable,
  cancelTableChanges,
  showHideTitle
} from "@/helpers/table/generator";

import {
  deselectGroup
} from "@/helpers/utils";
import {
  deselectGroupSeats
} from "@/helpers/seatUtils";
export default {
  props: {
    editTable: {
      type: Object,
      default: () => {},
    },
  },
  watch: {},
  data() {
    return {
      editData: {},
    };
  },
  created() {
    this.editData = _.cloneDeep(this.editTable);
  },
  methods: {
    editTableHelper() {
      const { layerId, type } = this.editTable;
      let inputValue = !isNaN(this.editData.seats) ? parseFloat(this.editData.seats) : false;
      let cappedValue;
      if (type === "round") {
        cappedValue = inputValue ?  Math.min(inputValue, 16) : '';
      } else if (type === "square") {
        cappedValue = Math.min(inputValue, 24);
      } else if (type === "rectangle") {
        cappedValue = inputValue;
      }

      this.editData.seats = cappedValue;

      const payload = {
        tableData: this.editTable,
        newData: this.editData,
      };
    
      updateTableStage(layerId, payload);

    },
    updateTable() {
      const { layerId } = this.editTable;
      
      deselectGroupSeats(layerId);
      deselectGroup();
      this.$emit("closeModal");
    },
    changeRotation() {
      rotateTable(
        this.editData.rotation,
        this.editTable.layerId,
        this.editData
      );
    },
    cancelChanges() {
      cancelTableChanges(this.editTable)
      this.$emit("cancel", this.editTable);
    },
    displayTitle(){
      const { hideTitle } = this.editData;
      const { layerId } = this.editTable;
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
