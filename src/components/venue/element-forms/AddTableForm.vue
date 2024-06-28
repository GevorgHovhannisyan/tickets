<template>
  <div class="table_section">
    <div class="modal_title">New Table Section</div>
    <div class="modal_description">
      Configure your new section. You can change this any time
    </div>

    <ValidationObserver ref="create_table" slim v-slot="{ handleSubmit, reset }">
      <form class="create_table" @submit.prevent="handleSubmit(submitTable)" @reset.prevent="reset" autocomplete="off">
        <div class="field_block">
          <ValidationProvider name="name" v-slot="{ errors }" slim rules="required">
            <label :class="{ has_error: errors[0] }">
              <span class="field_name">Table name</span>
              <textarea rows="2" maxlength="20" v-model="table.name" name="name"></textarea>
              <span class="error_message">{{ errors[0] ? "Required field": "" }}</span>
            </label>
          </ValidationProvider>
        </div>
        <div class="field_block">
          <ValidationProvider name="seats" v-slot="{ errors }" slim rules="required">
            <label :class="{ has_error: errors[0] }">
              <span class="field_name">Table seats</span>

              <v-select v-if="table.type === 'rectangle' || table.type === 'square'" v-model="table.seats"
                :options="tableOptions[table.type]" :reduce="(materials) => materials" :searchable="false"
                :clearable="false"></v-select>

              <input v-else type="text" oninput="this.value=this.value.replace(/[^0-9]/g,'');" name="seats" min="1" max="16" @input="checkNumberLimit" v-model="table.seats"
                class="no-arrow" />
              <span class="error_message">{{ errors[0] }}</span>
            </label>
          </ValidationProvider>
        </div>
        <div class="field_block table_types">
          <div class="types_parent">
            <div class="type_block" :class="{ selected: table.type === 'round' }" @click="changeType('round')">
              <label>
                <input type="radio" name="table" value="round" v-model="table.type" />
                <img src="/img/round.svg" alt="" />
              </label>
            </div>
            <div class="type_block" :class="{ selected: table.type === 'rectangle' }" @click="changeType('rectangle')">
              <label>
                <input type="radio" name="table" value="rectangle" v-model="table.type" />
                <img src="/img/rectangle.svg" alt="" />
              </label>
            </div>
            <div class="type_block" :class="{ selected: table.type === 'square' }" @click="changeType('square')">
              <label>
                <input type="radio" name="table" value="square" v-model="table.type" />
                <img src="/img/square.svg" alt="" />
              </label>
            </div>
          </div>
        </div>
        <span class="divider"></span>

        <div class="form_btns">
          <a class="secondary_btn" @click="$emit('closePopup')">Cancel</a>
          <button class="primary_btn" aria-label="add table">Add Table</button>
        </div>
      </form>
    </ValidationObserver>
  </div>
</template>

<script>
import { mapGetters } from "vuex";
export default {
  data() {
    return {
      table: {
        name: null,
        seats: 8,
        type: "round",
        rotation: 0,
        fontSize: 20,
        spacing: 0,
        bold: false,
        upperCase: false,
        lineHeight: 1.33,
        hideTitle: false
      },
    };
  },
  computed: {
    ...mapGetters(["tableOptions"]),
  },
  methods: {
    submitTable() {
      this.$emit("submitTable", {
        type: "table",
        data: { ...this.table },
      });
    },
    checkNumberLimit() {
      
      let inputValue = !isNaN(this.table.seats) ? parseFloat(this.table.seats) : false;
      let cappedValue;
      const { type } = this.table;
      if (type === "round") {
        cappedValue = inputValue ?  Math.min(inputValue, 16) : '';
      } else if (type === "square") {
        cappedValue = Math.min(inputValue, 24);
      } else if (type === "rectangle") {
        cappedValue = inputValue;
      }

      this.table.seats = cappedValue;
    },
    changeType(type) {
      this.table.type = type;
      this.checkNumberLimit();
    },
  },
};
</script>

<style lang="scss">
.table_types {
  max-width: 200px;
  display: flex;
  justify-content: center;
}

.types_parent {
  display: flex;
  align-items: center;
  margin: 0 -10px;

  .type_block {
    margin: 0 5px;
  }
}
</style>
